-- Street Smart Database Schema
-- Tables for issues, reviews, and user profiles

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Issues table
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'in_progress')),
  helpful_votes INTEGER DEFAULT 0,
  not_there_votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Everyone can view issues
CREATE POLICY "issues_select_all" ON public.issues FOR SELECT USING (true);
-- Only authenticated users can create issues
CREATE POLICY "issues_insert_auth" ON public.issues FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own issues
CREATE POLICY "issues_update_own" ON public.issues FOR UPDATE USING (auth.uid() = user_id);
-- Users can delete their own issues
CREATE POLICY "issues_delete_own" ON public.issues FOR DELETE USING (auth.uid() = user_id);

-- Reviews/Votes table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_there')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(issue_id, user_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
-- Authenticated users can create reviews
CREATE POLICY "reviews_insert_auth" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own reviews
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
-- Users can delete their own reviews
CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Function to update issue vote counts
CREATE OR REPLACE FUNCTION public.update_issue_votes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'helpful' THEN
      UPDATE public.issues SET helpful_votes = helpful_votes + 1 WHERE id = NEW.issue_id;
    ELSE
      UPDATE public.issues SET not_there_votes = not_there_votes + 1 WHERE id = NEW.issue_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'helpful' THEN
      UPDATE public.issues SET helpful_votes = helpful_votes - 1 WHERE id = OLD.issue_id;
    ELSE
      UPDATE public.issues SET not_there_votes = not_there_votes - 1 WHERE id = OLD.issue_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.vote_type != NEW.vote_type THEN
    IF OLD.vote_type = 'helpful' THEN
      UPDATE public.issues SET helpful_votes = helpful_votes - 1, not_there_votes = not_there_votes + 1 WHERE id = NEW.issue_id;
    ELSE
      UPDATE public.issues SET helpful_votes = helpful_votes + 1, not_there_votes = not_there_votes - 1 WHERE id = NEW.issue_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_review_change ON public.reviews;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_issue_votes();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_issues_location ON public.issues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_user ON public.issues(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_issue ON public.reviews(issue_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
