# Feature Specification: Email Timeline Invites

**Feature Branch**: `002-email-timeline-invites`
**Created**: 2026-01-08
**Status**: Draft
**Input**: User description: "I need to implement a complete email invitation feature so I can invite other users to use the app with me. Some timelines should be visible only to invited users, for example if a user joins he should see only timelines he created and only the ones he was invited to see. When user receives an email he should click on the link and register in the app, we don't need to confirm the email for now for registered users."

## Clarifications

### Session 2026-01-08

- Q: When a logged-in user clicks an invitation link intended for a different email address, what should happen? → A: Show error and offer to log out, then redirect to login/register for the correct email
- Q: What information should the invitation email include beyond the invitation link? → A: Standard: Inviter's name, timeline name, assigned role, and link

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send Email Invitation to New User (Priority: P1)

A timeline admin wants to invite a collaborator who doesn't have an account yet. The admin enters the invitee's email address and selects a role. The system sends an email with a unique invitation link. The recipient clicks the link and is taken to a registration page where they create their account. Upon successful registration, they are automatically added to the timeline with the assigned role.

**Why this priority**: This is the core value proposition - enabling collaboration with people outside the app. Without this, admins must manually coordinate account creation and then invite, which is cumbersome and error-prone.

**Independent Test**: Can be fully tested by sending an invite email to a new email address, clicking the link, completing registration, and verifying the new user can access the timeline with the correct role.

**Acceptance Scenarios**:

1. **Given** an admin is viewing a timeline they own, **When** they enter an email address not associated with any account and select a role, **Then** an invitation email is sent to that address containing a unique invitation link
2. **Given** a person receives an invitation email, **When** they click the invitation link, **Then** they are taken to a registration page pre-filled with their email address
3. **Given** a person is on the invite registration page, **When** they complete registration with name and password, **Then** they are automatically added to the invited timeline with the specified role and logged in
4. **Given** a person clicks an invitation link, **When** the invitation has already been used or expired, **Then** they see an appropriate error message explaining the link is no longer valid

---

### User Story 2 - Send Email Invitation to Existing User (Priority: P2)

A timeline admin wants to invite someone who already has an account in the system. The admin enters the email address, and the system recognizes it belongs to an existing user. An invitation email is sent, and when the existing user clicks the link, they are added to the timeline immediately (if logged in) or prompted to log in first.

**Why this priority**: Important for collaboration but lower than P1 because the current system already supports inviting existing users through search. Email invite adds convenience but isn't the only path.

**Independent Test**: Can be tested by inviting an existing user's email, clicking the link while logged in as that user, and verifying they now have access to the timeline.

**Acceptance Scenarios**:

1. **Given** an admin enters an email for an existing user, **When** the invitation is sent, **Then** the email is sent and the invitation is associated with that existing user
2. **Given** an existing user clicks the invitation link while logged in, **When** they are the intended recipient, **Then** they are added to the timeline and redirected to it
3. **Given** an existing user clicks the invitation link while not logged in, **When** they log in with the correct account, **Then** they are added to the timeline and redirected to it

---

### User Story 3 - Timeline Visibility Based on Membership (Priority: P1)

Users should only see timelines they have access to. A user sees timelines they created (as owner) and timelines where they have been invited as a member. They should not see timelines owned by others unless explicitly invited.

**Why this priority**: This is essential for data privacy and multi-tenant operation. Without this, users could see each other's private timelines, which is a security issue.

**Independent Test**: Can be tested by creating two users, having each create a timeline, and verifying neither can see the other's timeline until invited.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they view the timeline list, **Then** they only see timelines they own or are members of
2. **Given** a user creates a new account via direct registration (not invitation), **When** they view the timeline list, **Then** it is empty until they create a timeline or are invited to one
3. **Given** a user was invited to a timeline and later removed, **When** they view the timeline list, **Then** that timeline no longer appears

---

### User Story 4 - Manage Pending Invitations (Priority: P3)

Timeline admins can view and manage pending email invitations that haven't been accepted yet. They can resend invitation emails or cancel pending invitations.

**Why this priority**: Nice-to-have management capability. Core invite flow works without this, but it helps admins track and manage invitations.

**Independent Test**: Can be tested by sending an invitation, viewing the pending invitations list, resending the email, and canceling the invitation.

**Acceptance Scenarios**:

1. **Given** an admin has sent email invitations, **When** they view the members section, **Then** they see a list of pending invitations with email, role, and sent date
2. **Given** a pending invitation exists, **When** the admin resends the invitation, **Then** a new email is sent with the same invitation link
3. **Given** a pending invitation exists, **When** the admin cancels it, **Then** the invitation link becomes invalid and the pending invite is removed

---

### Edge Cases

- What happens when a user clicks an expired invitation link (beyond 7-day validity period)?
  - System shows a clear message that the invitation has expired and suggests contacting the timeline admin
- What happens when someone tries to register with an email that already has an account via the invitation flow?
  - System detects the existing account and prompts them to log in instead, then processes the invitation
- What happens if an admin invites the same email twice before the first invitation is accepted?
  - System reuses the existing pending invitation and resends the email with the same token (or updates the role if changed)
- What happens if the inviting admin loses admin access before the invitation is accepted?
  - The invitation remains valid; it was authorized at the time it was created
- How does the system handle email sending failures?
  - System reports the failure to the admin immediately and does not create a pending invitation
- What happens when a logged-in user clicks an invitation link meant for a different email address?
  - System shows an error explaining the invitation is for a different account, offers a logout option, and redirects to login/register for the correct email

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow timeline admins to invite users by email address
- **FR-002**: System MUST send invitation emails containing a unique, secure invitation link
- **FR-003**: Invitation links MUST expire after 7 days from creation
- **FR-004**: System MUST support inviting users who do not yet have accounts (new user flow)
- **FR-005**: System MUST support inviting users who already have accounts (existing user flow)
- **FR-006**: New users registering via invitation MUST be automatically added to the timeline with the specified role
- **FR-007**: System MUST pre-fill the email address on the registration form when accessed via invitation link
- **FR-008**: Users MUST only see timelines they own or are members of in the timeline list
- **FR-009**: System MUST prevent duplicate pending invitations to the same email for the same timeline
- **FR-010**: Admins MUST be able to view pending invitations for their timeline
- **FR-011**: Admins MUST be able to resend or cancel pending invitations
- **FR-012**: Invitation tokens MUST be cryptographically secure and non-guessable
- **FR-013**: System MUST validate that the person registering via invite uses the email address the invitation was sent to
- **FR-014**: System MUST track invitation metadata: who sent it, when, and the assigned role
- **FR-015**: System MUST prevent a logged-in user from accepting an invitation intended for a different email address, showing an error with logout option
- **FR-016**: Invitation emails MUST include: inviter's name, timeline name, assigned role, and the invitation link

### Key Entities

- **Invitation**: Represents a pending invitation with email, role, token, timeline reference, inviting user, creation date, expiration date, and status (pending/accepted/expired/cancelled)
- **Invitation Token**: A secure, unique string used in the invitation link to identify and validate the invitation

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can send an invitation and have the recipient registered and collaborating within 5 minutes of receiving the email
- **SC-002**: 100% of users can only view timelines they are authorized to access (no unauthorized timeline visibility)
- **SC-003**: New users completing registration via invitation link are added to the timeline on first login without additional steps
- **SC-004**: Invitation emails are delivered within 2 minutes of being sent
- **SC-005**: At least 90% of invited users successfully complete registration when they click the invitation link
- **SC-006**: Admins can view all pending invitations for their timeline in one place

## Assumptions

- **Email Service**: The system will use an email delivery service (SMTP or transactional email API) that will be configured as part of implementation
- **Email Templates**: Basic, functional email templates will be used; advanced branding can be added later
- **Invitation Validity**: 7-day expiration is a reasonable default based on industry standards
- **Single Use**: Each invitation token can only be used once (for registration or adding existing user)
- **No Email Verification**: As specified, registered users do not need to verify their email addresses
- **Existing Member Search**: The current "invite existing user" modal will remain available as an alternative to email invites
