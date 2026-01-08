# Quickstart: Email Timeline Invites Development

**Feature**: 002-email-timeline-invites
**Date**: 2026-01-08

## Prerequisites

Ensure you have the base project running:
```bash
# Backend (terminal 1)
cd backend && bun run dev    # http://localhost:3000

# Frontend (terminal 2)
cd frontend && bun run dev   # http://localhost:5173
```

## Email Testing Setup

### Option 1: Ethereal.email (Recommended for Development)

Ethereal is a fake SMTP service that captures emails without sending them.

1. **Create account at https://ethereal.email/** (one-click, no signup)

2. **Configure backend/.env**:
   ```env
   # Email Configuration
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=your-ethereal-username@ethereal.email
   SMTP_PASS=your-ethereal-password
   SMTP_FROM=noreply@festival-timeline.app

   # Frontend URL for invitation links
   FRONTEND_URL=http://localhost:5173
   ```

3. **View sent emails**: Go to https://ethereal.email/ → Login → Messages

### Option 2: Mailpit (Local SMTP Server)

For offline development with a local web UI.

1. **Install Mailpit**:
   ```bash
   brew install mailpit  # macOS
   # or download from https://github.com/axllent/mailpit/releases
   ```

2. **Run Mailpit**:
   ```bash
   mailpit
   # SMTP: localhost:1025
   # Web UI: http://localhost:8025
   ```

3. **Configure backend/.env**:
   ```env
   SMTP_HOST=localhost
   SMTP_PORT=1025
   SMTP_USER=
   SMTP_PASS=
   SMTP_FROM=noreply@festival-timeline.app
   FRONTEND_URL=http://localhost:5173
   ```

### Option 3: Gmail SMTP (For Integration Testing)

Use a real Gmail account to test actual email delivery.

1. **Enable 2FA on Gmail account**

2. **Generate App Password**:
   - https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"

3. **Configure backend/.env**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com
   FRONTEND_URL=http://localhost:5173
   ```

## Database Migration

Run the migration to add the invitations table:

```bash
cd backend

# Apply invitation schema migration
bun run db:migrate

# Verify table was created
psql -d festival_timeline -c "\d timeline_invitations"
```

## Manual Testing Workflow

### Test 1: Invite New User

1. **Login as admin**: http://localhost:5173/auth
   - Email: `admin@festival.app`
   - Password: `admin123`

2. **Navigate to timeline members**: Select a timeline → Members section

3. **Send invitation**:
   - Click "Invite by Email"
   - Enter: `newuser@test.com`
   - Select role: `Editor`
   - Click "Send Invitation"

4. **Check email**: View in Ethereal/Mailpit

5. **Click invitation link**: Opens registration page with pre-filled email

6. **Complete registration**: Enter name and password

7. **Verify**: New user sees the timeline in their list

### Test 2: Invite Existing User

1. **Create second user**: Register at http://localhost:5173/auth/register
   - Email: `existing@test.com`

2. **As admin, invite existing user**:
   - Enter: `existing@test.com`
   - Select role: `Viewer`

3. **As existing user**: Click link in email while logged in → Auto-added to timeline

### Test 3: Email Mismatch Error

1. **Send invite to**: `invited@test.com`

2. **Login as different user**: `other@test.com`

3. **Click invitation link**: Should see error with logout option

### Test 4: Expired Invitation

1. **Manually expire an invitation** (for testing):
   ```sql
   UPDATE timeline_invitations
   SET expiresAt = NOW() - INTERVAL '1 hour'
   WHERE email = 'test@test.com';
   ```

2. **Click invitation link**: Should see "invitation expired" message

### Test 5: Invitation Valid After Inviter Loses Admin Access

This test verifies that invitations are authorized at creation time.

1. **As admin, send invitation** to `test5@test.com`

2. **Demote the inviter**: Remove admin role or remove from timeline entirely
   ```sql
   UPDATE timeline_members
   SET role = 'Viewer'
   WHERE userId = (SELECT id FROM users WHERE email = 'admin@festival.app');
   ```

3. **As invited user, click invitation link**: Should still be able to accept (invitation was authorized when created)

4. **Restore admin role**:
   ```sql
   UPDATE timeline_members
   SET role = 'Admin'
   WHERE userId = (SELECT id FROM users WHERE email = 'admin@festival.app');
   ```

## API Testing with cURL

### Create Invitation

```bash
# Get auth token first
TOKEN=$(curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@festival.app","password":"admin123"}' \
  | jq -r '.token')

# Create invitation
curl -X POST http://localhost:3000/api/timelines/{timelineId}/invitations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","role":"Editor"}'
```

### Validate Token

```bash
curl http://localhost:3000/api/invitations/validate/{token}
```

### Accept Invitation (New User)

```bash
curl -X POST http://localhost:3000/api/invitations/accept/{token} \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","password":"password123"}'
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMTP_HOST` | Yes | - | SMTP server hostname |
| `SMTP_PORT` | No | 587 | SMTP server port |
| `SMTP_USER` | Yes | - | SMTP authentication username |
| `SMTP_PASS` | Yes | - | SMTP authentication password |
| `SMTP_FROM` | Yes | - | From address for emails |
| `SMTP_SECURE` | No | false | Use TLS (set true for port 465) |
| `FRONTEND_URL` | Yes | - | Base URL for invitation links |

## Troubleshooting

### Email not sending

1. Check SMTP credentials in `.env`
2. Verify SMTP server is reachable: `telnet smtp.ethereal.email 587`
3. Check backend logs for nodemailer errors

### Token validation fails

1. Ensure token is URL-decoded
2. Check invitation hasn't expired:
   ```sql
   SELECT expiresAt, status FROM timeline_invitations WHERE id = '...';
   ```

### Migration fails

1. Check PostgreSQL connection
2. Ensure `member_role` enum exists (from migration 003)
3. Run migrations in order: `003_multi_timeline.sql` before `004_invitations.sql`

## Next Steps

After setting up the development environment:

1. Review [data-model.md](./data-model.md) for database schema
2. Review [contracts/invitations-api.yaml](./contracts/invitations-api.yaml) for API specs
3. Wait for task generation (`/speckit.tasks`) to get implementation tasks
