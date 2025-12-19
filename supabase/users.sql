-- =====================================================
-- Users & Roles System Schema
-- =====================================================

-- 1. Users Table (جدول المستخدمين)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT,
  avatar_url TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  birthdate DATE,
  country TEXT,
  bio TEXT,
  coins INTEGER DEFAULT 0,
  diamonds INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned', 'suspended', 'pending')),
  role_id UUID REFERENCES public.roles(id),
  is_verified BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id)
);

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role_id);

-- 2. Roles Table (جدول الأدوار)
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Permissions Table (جدول الصلاحيات)
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Role-Permissions Mapping (ربط الأدوار بالصلاحيات)
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_role_permission_unique ON public.role_permissions(role_id, permission_id);

-- 5. User-Role Mapping (ربط المستخدمين بالأدوار)
-- (اختياري إذا أردت دعم تعدد الأدوار للمستخدم)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_role_unique ON public.user_roles(user_id, role_id);

-- 6. RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow admin to manage all
CREATE POLICY "Admin can manage all users" ON public.users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.is_admin)
);

DROP POLICY IF EXISTS "Admin can manage all users" ON public.users;
DROP POLICY IF EXISTS "User can view/edit own data" ON public.users;
DROP POLICY IF EXISTS "User can edit own data" ON public.users;


CREATE POLICY "Admin can manage all users" ON public.users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.is_admin)
);


CREATE POLICY "User can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User can edit own data" ON public.users FOR UPDATE USING (auth.uid() = id);
);
CREATE POLICY "Admin can manage role_permissions" ON public.role_permissions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.is_admin)
);
CREATE POLICY "Admin can manage user_roles" ON public.user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.is_admin)
);

-- 7. Comments
COMMENT ON TABLE public.users IS 'جدول المستخدمين مع دعم كامل للوحة التحكم والصلاحيات';
COMMENT ON TABLE public.roles IS 'جدول الأدوار (roles)';
COMMENT ON TABLE public.permissions IS 'جدول الصلاحيات (permissions)';
COMMENT ON TABLE public.role_permissions IS 'ربط الأدوار بالصلاحيات';
COMMENT ON TABLE public.user_roles IS 'ربط المستخدمين بالأدوار (يدعم تعدد الأدوار)';

-- 8. Success Message
DO $$
BEGIN
  RAISE NOTICE '✅ Users & Roles System Schema created successfully!';
  RAISE NOTICE '📦 Tables: users, roles, permissions, role_permissions, user_roles';
END $$;
