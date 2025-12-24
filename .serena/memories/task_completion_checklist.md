# Task Completion Checklist

When completing a development task, ensure the following:

## Code Quality
1. **Type Check**: Run `bun run type-check` in both frontend and backend
2. **Linting**: Run `bun run lint` to check for code style issues
3. **Build**: Ensure `bun run build` succeeds

## Testing
1. **Unit Tests**: Run `bun run test` in affected directories
2. **E2E Tests**: Run `bun run test:e2e` in frontend for UI changes

## Database Changes
- If schema changed, create migration in `/backend/src/db/migrations/`
- Run `bun run db:migrate` to apply changes
- Update seed data if needed

## Documentation
- Update CLAUDE.md if adding new patterns or commands
- Update PROJECT.md for feature changes or new user stories

## Git Commits
- **DO NOT commit automatically** - user will decide when to commit
- Prepare meaningful commit message describing changes

## Verification
- Test the feature manually in browser
- Check browser console for errors
- Verify API responses in Network tab
