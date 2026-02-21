# Admin Panel Setup Guide

## Setting Up Admin Access

The admin email has been configured as: **friday.ogboji100@gmail.com**

### Steps to Grant Admin Access:

#### Option 1: Using the Set Admin Script (Recommended)

1. First, make sure the user has signed up in the application
2. Run the set-admin script:

```bash
npm run set-admin
```

This will:
- Find the user with email `friday.ogboji100@gmail.com`
- Update their role to `admin`
- Create an audit log entry
- Display confirmation message

#### Option 2: Using Prisma Studio (Manual)

1. Open Prisma Studio:
```bash
npx prisma studio
```

2. Navigate to the `User` model
3. Find the user with email `friday.ogboji100@gmail.com`
4. Edit the `role` field and change it to `admin`
5. Save the changes

#### Option 3: Using SQL Directly

If you have direct database access:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'friday.ogboji100@gmail.com';
```

## Accessing the Admin Panel

Once admin access is granted, navigate to:

```
http://localhost:3000/admin/dashboard
```

Or in production:
```
https://your-domain.com/admin/dashboard
```

## Admin Panel Features

The admin panel includes the following pages:

1. **Dashboard** - Overview of key metrics and recent activity
2. **Users** - Manage all users, edit roles, view statistics
3. **Posts** - Moderate posts, change status, delete content
4. **Campaigns** - View and manage all campaigns
5. **Analytics** - Detailed analytics and reports with charts
6. **Billing** - View billing overview and premium users
7. **Transactions** - View all payment transactions
8. **Plans** - Manage subscription plans
9. **Platforms** - Overview of platform integrations
10. **API Keys** - Manage API keys for users
11. **Audit Logs** - View system activity and admin actions
12. **Settings** - Configure system settings

## Security Notes

- Only users with `role: "admin"` can access the admin panel
- All admin actions are logged in the audit logs
- The admin panel is protected by Clerk authentication
- Admin actions include user management, post moderation, and system configuration

## Troubleshooting

### "User not found" error
- Make sure the user has signed up in the application first
- Check that the email is correct in the script

### Cannot access admin panel
- Verify the user's role is set to "admin" in the database
- Clear browser cache and cookies
- Check that you're signed in with the correct account

### Permission denied
- Only users with `role: "admin"` can access admin pages
- Verify the role in Prisma Studio or the database

## Adding More Admins

To add additional admin users, you can:

1. Update the email in `scripts/set-admin.ts`
2. Run `npm run set-admin` again

Or create multiple admin users by modifying the script to accept command-line arguments.
