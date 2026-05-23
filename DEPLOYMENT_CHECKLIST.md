# Deployment Checklist & Important Notes

## ✅ Pre-Deployment Verification

### Database Changes
- [ ] Run migrations on `Admin UI/supabase/schema.sql` to add `user_id` column
- [ ] Verify RLS policy "Users read own complaints" is created
- [ ] Test that existing complaints still appear in admin dashboard
- [ ] Test that user can only see their own complaints

### Frontend Changes (User UI)
- [ ] Install new components are in place
- [ ] AuthProvider wraps the App
- [ ] All routes are configured
- [ ] Environment variables still set correctly

### Frontend (Admin UI)
- [ ] No changes made - admin dashboard should work exactly as before
- [ ] Verify admin can still see all complaints
- [ ] Verify admin can still update complaint status

---

## 🚀 Deployment Steps

### Step 1: Deploy Database Changes
1. Open Supabase console
2. Go to SQL Editor
3. Copy all new SQL from `schema.sql`
4. Run the migrations
5. Verify no errors

### Step 2: Deploy User UI Changes
1. Commit all changes to git
2. Push to your deployment platform (Netlify, Vercel, etc.)
3. Wait for build to complete
4. Test on production

### Step 3: Test Everything Works

#### Test Admin Features
- [ ] Admin can sign in
- [ ] Admin sees all complaints
- [ ] Admin can update complaint status
- [ ] Admin can view users

#### Test User Features
- [ ] User can sign up
- [ ] User can sign in
- [ ] User sees only their complaints
- [ ] User can submit new complaint
- [ ] User can view complaint timeline
- [ ] User can search/filter complaints

#### Test Anonymous Features
- [ ] Anonymous user can submit complaint
- [ ] Gets reference code
- [ ] Complaint appears in admin dashboard
- [ ] Admin can see anonymous complaints

---

## 🔒 Security Checklist

- [ ] RLS policies are enabled on complaints table
- [ ] Users can only see their own complaints (tested)
- [ ] Admin can see all complaints
- [ ] Password fields are properly masked
- [ ] Auth tokens are stored securely
- [ ] CORS is properly configured

---

## 📊 Admin Dashboard Changes

### What Changed
✅ Nothing! Admin dashboard works exactly the same

### Admin Can Still
✅ View all complaints (no RLS affects admins)  
✅ Update any complaint status  
✅ Search and filter complaints  
✅ View complaint details  
✅ Manage users  
✅ View analytics  

### Behind The Scenes
- Admin RLS policy "Staff read complaints" allows admins to bypass user RLS
- Existing code doesn't change
- Admin app is unaffected

---

## 🔄 Rollback Plan

If something goes wrong:

### Rollback Database
1. Drop the `user_id` column
2. Drop the "Users read own complaints" policy
3. Keep everything else unchanged

```sql
ALTER TABLE public.complaints DROP COLUMN user_id;
DROP POLICY "Users read own complaints" ON public.complaints;
```

### Rollback Frontend
1. Revert to previous git commit
2. Redeploy

---

## ⚠️ Important Notes

### For Admin Team
- **No action needed** from admin team
- Admin dashboard will continue to work
- All admin features unchanged
- Still can view and manage all complaints

### For Users/Students  
- New "Sign In" option on landing page
- Can now track their complaints in dashboard
- Still can submit anonymous complaints
- Can see timeline and estimated resolution dates

### For Database
- `user_id` is nullable (backward compatible)
- Existing complaints continue to work
- No data loss
- RLS only affects user queries, not admin

---

## 📞 Support

### Common Issues

**Issue: "User can't see complaints"**
- [ ] Check user is signed in
- [ ] Check RLS policy exists
- [ ] Verify `user_id` is saved when complaint created

**Issue: "Admin can't see all complaints"**
- [ ] Check admin RLS policy "Staff read complaints" exists
- [ ] Check user role is 'admin' or 'super_admin'
- [ ] Check `is_staff()` function works

**Issue: "New complaints aren't saved"**
- [ ] Check `user_id` is being sent
- [ ] Check RLS policy "Anyone insert complaint" is enabled
- [ ] Check database has space

---

## 📈 Monitoring

Monitor these metrics:

- New user signups
- Dashboard usage
- Complaint submission rate
- Page performance
- Error rates

---

## 🎉 Deployment Complete!

Once deployed, your system will have:

✅ User authentication  
✅ Complaint tracking  
✅ Timeline visualization  
✅ Advanced filtering  
✅ Secure RLS  
✅ Full admin access  
✅ Zero breaking changes  

Celebrate! 🚀
