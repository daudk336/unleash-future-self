import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Box, Check,
  CircleAlert, Clock3, Leaf, LoaderCircle, LockKeyhole, LogOut, Plus, RefreshCw,
  Search, ShieldCheck, Sparkles, Trash2, X,
} from 'lucide-react';
import { Link, Redirect, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import {
  getGetHealthQueryKey, getGetMeQueryKey, getHealthCheckQueryKey,
  getListAdminItemsQueryKey, getListItemsQueryKey, useCreateItem, useDeleteItem,
  useEnsureMyRole, useGetHealth, useGetMe, useHealthCheck, useListAdminItems, useListItems,
} from '@workspace/api-client-react';
import type { ItemInput, PantryItem } from '@workspace/api-client-react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 20_000 } },
});
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#3e7163',
    colorForeground: '#253a35',
    colorMutedForeground: '#687c75',
    colorDanger: '#ad5146',
    colorBackground: '#fbf8f0',
    colorInput: '#f6f1e6',
    colorInputForeground: '#253a35',
    colorNeutral: '#d9d1c1',
    fontFamily: 'Arial, sans-serif',
    borderRadius: '1rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fbf8f0] rounded-2xl w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'font-display text-[#253a35]',
    headerSubtitle: 'text-[#687c75]',
    socialButtonsBlockButtonText: 'text-[#253a35]',
    formFieldLabel: 'text-[#253a35]',
    footerActionLink: 'text-[#3e7163]',
    footerActionText: 'text-[#687c75]',
    dividerText: 'text-[#687c75]',
    identityPreviewEditButton: 'text-[#3e7163]',
    formFieldSuccessText: 'text-[#3e7163]',
    alertText: 'text-[#8f443b]',
    logoBox: 'rounded-xl overflow-hidden',
    logoImage: 'object-contain',
    socialButtonsBlockButton: 'border-[#d9d1c1] bg-[#fbf8f0]',
    formButtonPrimary: 'bg-[#3e7163] hover:bg-[#315f53] text-[#fbf8f0]',
    formFieldInput: 'bg-[#f6f1e6] border-[#d9d1c1] text-[#253a35]',
    footerAction: 'text-[#687c75]',
    dividerLine: 'bg-[#d9d1c1]',
    alert: 'bg-[#f6e7e0]',
    otpCodeFieldInput: 'bg-[#f6f1e6] border-[#d9d1c1]',
    formFieldRow: 'text-[#253a35]',
    main: 'text-[#253a35]',
  },
};

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" data-testid="link-pantry-home" className={`inline-flex items-center gap-3 ${inverse ? 'text-[#f4f0e5]' : 'text-[#253a35]'}`}>
      <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#3e7163] text-[#f5f0e4]">
        <Leaf size={20} strokeWidth={1.8} />
      </span>
      <span className="font-display text-[22px] font-semibold leading-none tracking-[-.04em]">Pantry Tracker</span>
    </Link>
  );
}

function TopNav() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-5 md:px-10 md:py-7">
      <Brand />
      <nav className="flex items-center gap-3 md:gap-7">
        <Link href="/sign-in" className="text-sm font-semibold text-[#536a62] transition hover:text-[#263d35]" data-testid="link-sign-in">Sign in</Link>
        <Link href="/sign-up" className="rounded-full bg-[#3e7163] px-5 py-3 text-sm font-semibold text-[#f8f4e9] transition hover:bg-[#315f53]" data-testid="link-sign-up">Make your pantry</Link>
      </nav>
    </header>
  );
}

function HomePage() {
  const health = useGetHealth({ query: { queryKey: getGetHealthQueryKey() } });
  const healthz = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });
  const apiReady = health.data?.ok === true || healthz.data?.status === 'ok';
  return (
    <main className="grain min-h-[100dvh] overflow-hidden bg-[#f5f1e7]">
      <TopNav />
      <section className="mx-auto grid min-h-[600px] max-w-[1240px] items-center gap-10 px-5 pb-20 pt-12 md:grid-cols-[1.05fr_.95fr] md:px-10 md:pb-28 md:pt-16">
        <div className="relative z-[1] max-w-[610px]">
          <div className="reveal mb-7 inline-flex items-center gap-2 rounded-full border border-[#d9d0bd] bg-[#fbf8f0] px-4 py-2 text-xs font-semibold uppercase tracking-[.15em] text-[#547568]">
            <Sparkles size={14} /> A little more in control
          </div>
          <h1 className="reveal reveal-delay-1 font-display text-[clamp(3.5rem,8vw,6.6rem)] font-medium leading-[.94] tracking-[-.065em] text-[#253a35]">
            Know what’s <span className="italic text-[#568273]">in</span> your pantry.
          </h1>
          <p className="reveal reveal-delay-2 mt-7 max-w-[450px] text-lg leading-8 text-[#66756c]">
            A calmer way to keep track of what you have, what’s running low, and what should be used next.
          </p>
          <div className="reveal reveal-delay-2 mt-9 flex flex-wrap items-center gap-3">
            <Link href="/sign-up" className="group inline-flex items-center gap-3 rounded-full bg-[#3e7163] px-6 py-4 text-[15px] font-semibold text-[#fbf8f0] shadow-[0_10px_24px_rgba(41,82,69,.16)] transition hover:-translate-y-0.5 hover:bg-[#315f53]" data-testid="link-get-started">
              Start your pantry <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/sign-in" className="inline-flex items-center gap-2 rounded-full px-5 py-4 text-[15px] font-semibold text-[#476358] hover:bg-[#eae5d8]" data-testid="link-returning-member">I already have an account</Link>
          </div>
          <p className="mt-8 flex items-center gap-2 text-xs text-[#7b8578]" data-testid="status-api-health">
            <span className={`h-2 w-2 rounded-full ${apiReady ? 'bg-[#5a9278]' : health.isError || healthz.isError ? 'bg-[#c16c59]' : 'bg-[#c4a765]'}`} />
            {apiReady ? 'Your pantry is ready when you are' : health.isError && healthz.isError ? 'Pantry services are taking a short pause' : 'Checking pantry services'}
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-[530px] md:ml-auto">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#e2c88d]/45 blur-3xl" />
          <div className="relative rounded-[38px] border border-[#ddd4c1] bg-[#e8e3d5] p-3 shadow-[0_25px_60px_rgba(50,66,55,.12)]">
            <div className="overflow-hidden rounded-[29px] bg-[#f8f5eb]">
              <div className="flex items-center justify-between border-b border-[#e6dfd0] px-6 py-5">
                <div>
                  <p className="font-mono-data text-[10px] uppercase tracking-[.18em] text-[#829186]">TODAY’S SHELF</p>
                  <p className="mt-1 font-display text-[23px] text-[#253a35]">Use these soon</p>
                </div>
                <span className="rounded-full bg-[#f1e4c5] px-3 py-1.5 text-xs font-semibold text-[#775d2f]">3 items</span>
              </div>
              <div className="space-y-3 p-4 md:p-5">
                <PreviewItem color="sage" name="Baby spinach" note="Use by tomorrow" amount="1 bag" />
                <PreviewItem color="coral" name="Oat milk" note="Use by Friday" amount="2 cartons" />
                <PreviewItem color="gold" name="Lemon tahini" note="Use by Sunday" amount="½ jar" />
              </div>
              <div className="mx-5 mb-5 flex items-center gap-3 rounded-2xl bg-[#e8eee6] px-4 py-4">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d4e3d5] text-[#47725f]"><Check size={17} /></span>
                <div><p className="text-sm font-semibold text-[#37594c]">Nothing gets forgotten.</p><p className="text-xs text-[#6e8275]">A clearer kitchen starts here.</p></div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-7 -left-6 hidden rounded-2xl border border-[#ddd4c1] bg-[#fbf8f0] px-5 py-4 shadow-[0_12px_30px_rgba(50,66,55,.1)] sm:block">
            <p className="font-mono-data text-[10px] uppercase tracking-[.15em] text-[#89958a]">ON YOUR SHELF</p>
            <p className="mt-1 font-display text-[25px] text-[#315f53]">Everything, accounted for.</p>
          </div>
        </div>
      </section>
      <section className="border-y border-[#ddd5c4] bg-[#eae5d8]">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-11 md:grid-cols-[1fr_2fr] md:items-center md:px-10 md:py-14">
          <p className="font-mono-data text-[11px] uppercase tracking-[.16em] text-[#76867a]">Less waste. Less guesswork.</p>
          <p className="max-w-[770px] font-display text-[clamp(1.8rem,3.5vw,3rem)] leading-[1.15] tracking-[-.04em] text-[#31483e]">A small, useful record of the food you’ve already brought home.</p>
        </div>
      </section>
      <section className="mx-auto max-w-[1240px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-12 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div>
            <p className="font-mono-data text-[11px] uppercase tracking-[.16em] text-[#70877a]">A steady little rhythm</p>
            <h2 className="mt-4 max-w-[440px] font-display text-5xl leading-[1.02] tracking-[-.055em] text-[#253a35] md:text-6xl">Make room for what’s next.</h2>
          </div>
          <p className="max-w-[530px] pb-1 text-base leading-7 text-[#66756c]">Pantry Tracker keeps the essentials close at hand, so meal planning feels a little easier and the good things get used in time.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Feature number="01" icon={<Box size={20} />} title="A clear shelf" text="See what you have and how much is left, without opening every cupboard." />
          <Feature number="02" icon={<Clock3 size={20} />} title="A gentle nudge" text="Dates stay visible, so the next thing to use is easy to spot." />
          <Feature number="03" icon={<Leaf size={20} />} title="Your own space" text="A personal inventory that stays simple, useful, and yours." />
        </div>
      </section>
      <footer className="bg-[#253a35] px-5 py-8 text-[#e8e4d8] md:px-10">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Brand inverse />
          <p className="text-xs text-[#b9c4b8]">A more thoughtful pantry, one item at a time.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 text-sm font-semibold text-[#e6c690] hover:text-[#f4dfb9]" data-testid="link-footer-sign-up">Get started <ArrowUpRight size={15} /></Link>
        </div>
      </footer>
    </main>
  );
}

function PreviewItem({ color, name, note, amount }: { color: string; name: string; note: string; amount: string }) {
  const tones: Record<string, string> = { sage: 'bg-[#d8e7dc] text-[#4f8069]', coral: 'bg-[#f1ddd2] text-[#b06c57]', gold: 'bg-[#efe4bf] text-[#9a7c3f]' };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#ebe5d8] bg-[#fbf9f2] px-3 py-3.5">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] ${tones[color]}`}><Leaf size={18} /></span>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#354a40]">{name}</p><p className="mt-0.5 text-xs text-[#879187]">{note}</p></div>
      <span className="text-xs font-medium text-[#718177]">{amount}</span>
    </div>
  );
}

function Feature({ number, icon, title, text }: { number: string; icon: ReactNode; title: string; text: string }) {
  return (
    <article className="group flex min-h-[250px] flex-col justify-between rounded-[26px] border border-[#ded6c5] bg-[#fbf8f0] p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7">
      <div className="flex items-center justify-between"><span className="font-mono-data text-xs text-[#a2a794]">{number}</span><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e8eee6] text-[#4e7968]">{icon}</span></div>
      <div><h3 className="font-display text-[28px] text-[#2e453b]">{title}</h3><p className="mt-2 max-w-[300px] text-sm leading-6 text-[#778278]">{text}</p></div>
    </article>
  );
}

function ClerkCacheSync() {
  const { isLoaded, userId } = useAuth();
  const cache = useQueryClient();
  const previousUser = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!isLoaded) return;
    if (previousUser.current !== undefined && previousUser.current !== userId) cache.clear();
    previousUser.current = userId ?? null;
  }, [isLoaded, userId, cache]);
  return null;
}

function RoleBootstrap() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const cache = useQueryClient();
  const ensure = useEnsureMyRole();
  const ensureRef = useRef(ensure.mutate);
  ensureRef.current = ensure.mutate;
  const completed = useRef<string | null>(null);
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || completed.current === userId) return;
    completed.current = userId;
    ensureRef.current(undefined, {
      onSuccess: (member) => {
        cache.setQueryData(getGetMeQueryKey(), member);
        void cache.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: () => {
        if (completed.current === userId) completed.current = null;
      },
    });
  }, [isLoaded, isSignedIn, userId, cache]);
  return null;
}

function ClerkRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Welcome back to your pantry', subtitle: 'Sign in to see what’s on your shelves.' } },
        signUp: { start: { title: 'Start your pantry', subtitle: 'A clearer view of what you have starts here.' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <ClerkCacheSync />
      <RoleBootstrap />
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/pantry" component={PantryRoute} />
        <Route path="/admin" component={AdminRoute} />
        <Route path="/access-denied" component={AccessDenied} />
        <Route component={NotFound} />
      </Switch>
    </ClerkProvider>
  );
}

function HomeRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  if (isLoaded && isSignedIn) return <Redirect to="/pantry" />;
  return <HomePage />;
}

function SignInPage() {
  return <div className="grain flex min-h-[100dvh] items-center justify-center bg-[#f5f1e7] px-4 py-10"><div className="w-full max-w-[500px]"><div className="mb-8 flex justify-center"><Brand /></div><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div></div>;
}
function SignUpPage() {
  return <div className="grain flex min-h-[100dvh] items-center justify-center bg-[#f5f1e7] px-4 py-10"><div className="w-full max-w-[500px]"><div className="mb-8 flex justify-center"><Brand /></div><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div></div>;
}

function Protected({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();
  const me = useGetMe({ query: { enabled: isLoaded && !!isSignedIn, queryKey: getGetMeQueryKey() } });
  if (!isLoaded || (isSignedIn && me.isLoading)) return <AppLoading label="Opening your pantry" />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  if (me.isError) return <AccountError retry={() => void me.refetch()} />;
  if (!me.data) return <AppLoading label="Opening your pantry" />;
  if (admin && me.data?.role !== 'admin') return <Redirect to="/access-denied" />;
  return <>{children}</>;
}

function PantryRoute() {
  return <Protected><PantryPage /></Protected>;
}
function AdminRoute() {
  return <Protected admin><AdminPage /></Protected>;
}

function PantryPage() {
  const items = useListItems({ query: { queryKey: getListItemsQueryKey() } });
  const me = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const cache = useQueryClient();
  const create = useCreateItem();
  const remove = useDeleteItem();
  const [formError, setFormError] = useState('');
  const filtered = (items.data ?? []).filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  const soonCount = (items.data ?? []).filter((item) => daysUntil(item.expiresOn) >= 0 && daysUntil(item.expiresOn) <= 3).length;
  const onCreate = (input: ItemInput) => {
    setFormError('');
    create.mutate({ data: input }, {
      onSuccess: () => {
        setShowForm(false);
        void cache.invalidateQueries({ queryKey: getListItemsQueryKey() });
      },
      onError: () => setFormError('That item could not be added. Please try again.'),
    });
  };
  const onDelete = (item: PantryItem) => {
    if (!window.confirm(`Remove ${item.name} from your pantry?`)) return;
    remove.mutate({ id: item.id }, {
      onSuccess: () => void cache.invalidateQueries({ queryKey: getListItemsQueryKey() }),
    });
  };
  return (
    <AppShell userId={me.data?.id} role={me.data?.role}>
      <div className="mx-auto max-w-[1100px] px-5 pb-16 pt-8 md:px-10 md:pt-12">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><p className="font-mono-data text-[11px] uppercase tracking-[.16em] text-[#789083]">Your kitchen, at a glance</p><h1 className="mt-2 font-display text-5xl tracking-[-.055em] text-[#253a35] md:text-6xl">My pantry</h1><p className="mt-3 text-[#6c7b71]">A little order for the things you keep close.</p></div>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3e7163] px-5 py-3.5 text-sm font-semibold text-[#fbf8f0] shadow-sm transition hover:bg-[#315f53]" data-testid="button-add-item"><Plus size={17} /> Add an item</button>
        </div>
        <div className="mt-9 grid gap-3 sm:grid-cols-3">
          <SummaryTile label="On your shelves" value={String(items.data?.length ?? 0)} note="items tracked" icon={<Box size={18} />} />
          <SummaryTile label="Use soon" value={String(soonCount)} note="within the next 3 days" icon={<Clock3 size={18} />} tone="warm" />
          <SummaryTile label="Your account" value={me.data?.role === 'admin' ? 'Admin' : 'Member'} note="personal inventory" icon={<ShieldCheck size={18} />} tone="soft" />
        </div>
        <div className="mt-10 flex flex-col justify-between gap-4 border-b border-[#ddd5c5] pb-4 sm:flex-row sm:items-center">
          <div><h2 className="font-display text-[30px] tracking-[-.04em] text-[#2d433a]">What you have</h2><p className="mt-1 text-sm text-[#7b857a]">{items.data?.length ?? 0} {items.data?.length === 1 ? 'item' : 'items'} in your pantry</p></div>
          <label className="flex w-full items-center gap-2 rounded-full border border-[#ddd5c5] bg-[#fbf8f0] px-4 py-2.5 text-[#829087] sm:max-w-[250px]"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find an item" className="w-full bg-transparent text-sm text-[#344b40] outline-none placeholder:text-[#a2a89d]" data-testid="input-search-items" /></label>
        </div>
        {items.isLoading ? <ItemSkeleton /> : items.isError ? <ErrorPanel retry={() => void items.refetch()} /> : filtered.length === 0 ? <EmptyPantry hasItems={Boolean(items.data?.length)} search={search} onAdd={() => setShowForm(true)} /> : (
          <div className="mt-5 divide-y divide-[#e6dfd1]">
            {filtered.map((item) => <PantryRow key={item.id} item={item} onDelete={() => onDelete(item)} pending={remove.isPending} />)}
          </div>
        )}
        {remove.isError && <p className="mt-3 text-sm font-medium text-[#a75043]" role="alert" data-testid="status-delete-item-error">That item could not be removed. Please try again.</p>}
        {showForm && <AddItemDialog onClose={() => { setShowForm(false); setFormError(''); }} onSubmit={onCreate} pending={create.isPending} error={formError} />}
      </div>
    </AppShell>
  );
}

function AppShell({ children, userId, role }: { children: ReactNode; userId?: string; role?: string }) {
  const { signOut } = useClerk();
  const [location] = useLocation();
  return (
    <div className="min-h-[100dvh] bg-[#f5f1e7]">
      <header className="border-b border-[#ddd5c5] bg-[#f8f5ec]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 md:px-10">
          <Brand />
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="/pantry" className={`rounded-full px-4 py-2 text-sm font-semibold ${location === '/pantry' ? 'bg-[#e7e9dc] text-[#315f53]' : 'text-[#6c7b71] hover:bg-[#efecdf]'}`} data-testid="link-nav-pantry">My pantry</Link>
            {role === 'admin' && <Link href="/admin" className={`rounded-full px-4 py-2 text-sm font-semibold ${location === '/admin' ? 'bg-[#e7e9dc] text-[#315f53]' : 'text-[#6c7b71] hover:bg-[#efecdf]'}`} data-testid="link-nav-admin">All items</Link>}
            <span className="mx-1 hidden h-6 w-px bg-[#ddd5c5] sm:block" />
            <span className="hidden max-w-[150px] truncate text-xs text-[#8a9589] md:block" data-testid="text-account-id">{userId ?? 'Pantry member'}</span>
            <button onClick={() => signOut({ redirectUrl: basePath || '/' })} aria-label="Sign out" className="ml-1 grid h-9 w-9 place-items-center rounded-full text-[#75857a] transition hover:bg-[#e8e4d7] hover:text-[#315f53]" data-testid="button-sign-out"><LogOut size={17} /></button>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-[#e0d9c9] px-5 py-5 text-center text-xs text-[#92998c]">A clear view of what’s on your shelf.</footer>
    </div>
  );
}

function SummaryTile({ label, value, note, icon, tone = 'sage' }: { label: string; value: string; note: string; icon: ReactNode; tone?: string }) {
  const styles: Record<string, string> = { sage: 'bg-[#e6eee5] text-[#477462]', warm: 'bg-[#f2e7d0] text-[#96743d]', soft: 'bg-[#e8e8de] text-[#6b7969]' };
  return <div className="flex items-center gap-4 rounded-[22px] border border-[#e0d9c9] bg-[#fbf8f0] p-4"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[15px] ${styles[tone]}`}>{icon}</span><div><p className="text-xs font-medium text-[#879187]">{label}</p><div className="mt-0.5 flex items-baseline gap-2"><span className="font-display text-[27px] leading-none text-[#2e453b]">{value}</span><span className="text-[11px] text-[#92998c]">{note}</span></div></div></div>;
}

function PantryRow({ item, onDelete, pending }: { item: PantryItem; onDelete: () => void; pending: boolean }) {
  const days = daysUntil(item.expiresOn);
  const urgency = days < 0 ? 'past' : days <= 3 ? 'soon' : 'fresh';
  return (
    <article className="group flex items-center gap-3 py-4 sm:gap-5" data-testid={`row-pantry-item-${item.id}`}>
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[17px] ${urgency === 'past' ? 'bg-[#f3e1db] text-[#ad5749]' : urgency === 'soon' ? 'bg-[#f2e7d0] text-[#98763f]' : 'bg-[#e5ede4] text-[#4d7b67]'}`}><Leaf size={19} /></span>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h3 className="truncate font-semibold text-[#354a40]" data-testid={`text-item-name-${item.id}`}>{item.name}</h3><ExpiryBadge urgency={urgency} days={days} /></div><p className="mt-1 text-xs text-[#8a9488]">Quantity <span className="font-mono-data text-[#62766a]">{item.quantity}</span><span className="mx-2 text-[#c0b8a7]">·</span>Added {formatDate(item.createdAt)}</p></div>
      <div className="hidden min-w-[125px] text-right sm:block"><p className="text-[10px] uppercase tracking-[.12em] text-[#a0a295]">Use by</p><p className="mt-1 text-sm font-medium text-[#52685c]">{formatDate(item.expiresOn)}</p></div>
      <button onClick={onDelete} disabled={pending} aria-label={`Remove ${item.name}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#a09f91] transition hover:bg-[#f4e4df] hover:text-[#ae5e4d] disabled:opacity-50" data-testid={`button-delete-item-${item.id}`}><Trash2 size={16} /></button>
    </article>
  );
}

function ExpiryBadge({ urgency, days }: { urgency: string; days: number }) {
  const text = urgency === 'past' ? 'Past date' : days === 0 ? 'Use today' : days === 1 ? 'Tomorrow' : urgency === 'soon' ? `${days} days left` : 'In good time';
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${urgency === 'past' ? 'bg-[#f3e1db] text-[#a75043]' : urgency === 'soon' ? 'bg-[#f2e7d0] text-[#896b36]' : 'bg-[#e7eee3] text-[#5f7c65]'}`}>{text}</span>;
}

function AddItemDialog({ onClose, onSubmit, pending, error }: { onClose: () => void; onSubmit: (input: ItemInput) => void; pending: boolean; error: string }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [expiresOn, setExpiresOn] = useState('');
  const [validation, setValidation] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setValidation('Give your item a name.');
    if (!expiresOn) return setValidation('Choose a use-by date.');
    const amount = Number(quantity);
    if (!Number.isFinite(amount) || amount < 0) return setValidation('Quantity must be zero or more.');
    setValidation('');
    onSubmit({ name: name.trim(), quantity: amount, expiresOn });
  }
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#1b3029]/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="add-title" data-testid="dialog-add-item">
      <div className="w-full max-w-[500px] rounded-t-[28px] border border-[#e2dac9] bg-[#fbf8f0] p-6 shadow-[0_24px_70px_rgba(30,49,40,.2)] sm:rounded-[28px] sm:p-8">
        <div className="flex items-start justify-between"><div><p className="font-mono-data text-[10px] uppercase tracking-[.16em] text-[#789083]">Add to the shelf</p><h2 id="add-title" className="mt-2 font-display text-3xl tracking-[-.04em] text-[#2e453b]">New pantry item</h2></div><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-[#718177] hover:bg-[#eeeadf]" aria-label="Close form" data-testid="button-close-add-item"><X size={18} /></button></div>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="block"><span className="mb-2 block text-xs font-semibold text-[#53695e]">Item name</span><input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="e.g. Chickpeas" className="w-full rounded-xl border border-[#dcd4c3] bg-[#f7f3e9] px-4 py-3 text-sm text-[#30483d] outline-none transition focus:border-[#729481] focus:ring-2 focus:ring-[#729481]/20" data-testid="input-item-name" /></label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="mb-2 block text-xs font-semibold text-[#53695e]">Quantity</span><input type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full rounded-xl border border-[#dcd4c3] bg-[#f7f3e9] px-4 py-3 text-sm text-[#30483d] outline-none focus:border-[#729481] focus:ring-2 focus:ring-[#729481]/20" data-testid="input-item-quantity" /></label>
            <label className="block"><span className="mb-2 block text-xs font-semibold text-[#53695e]">Use by</span><input type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} className="w-full rounded-xl border border-[#dcd4c3] bg-[#f7f3e9] px-3 py-3 text-sm text-[#30483d] outline-none focus:border-[#729481] focus:ring-2 focus:ring-[#729481]/20" data-testid="input-item-expiry" /></label>
          </div>
          {(validation || error) && <p className="flex items-center gap-2 text-xs font-medium text-[#a75043]" data-testid="status-add-item-error"><CircleAlert size={15} />{validation || error}</p>}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-full px-5 py-3 text-sm font-semibold text-[#68796f] hover:bg-[#eeeadf]" data-testid="button-cancel-add-item">Cancel</button><button type="submit" disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3e7163] px-6 py-3 text-sm font-semibold text-[#fbf8f0] hover:bg-[#315f53] disabled:opacity-60" data-testid="button-submit-item">{pending && <LoaderCircle className="animate-spin" size={16} />}{pending ? 'Adding item' : 'Add to pantry'}</button></div>
        </form>
      </div>
    </div>
  );
}

function EmptyPantry({ hasItems, search, onAdd }: { hasItems: boolean; search: string; onAdd: () => void }) {
  return <div className="mt-7 rounded-[28px] border border-dashed border-[#d5cebd] bg-[#f8f5ec] px-6 py-16 text-center" data-testid="empty-pantry">
    <span className="mx-auto grid h-14 w-14 place-items-center rounded-[20px] bg-[#e6eee5] text-[#4b7865]">{search ? <Search size={22} /> : <Leaf size={22} />}</span>
    <h3 className="mt-5 font-display text-3xl text-[#30483d]">{search ? 'Nothing on this shelf' : hasItems ? 'No matches this time' : 'Your pantry starts here'}</h3>
    <p className="mx-auto mt-2 max-w-[330px] text-sm leading-6 text-[#7f897d]">{search ? `We couldn't find “${search}”. Try another name.` : hasItems ? 'Try a different search to find what you are looking for.' : 'Add the first thing you’d like to keep an eye on.'}</p>
    {!hasItems && !search && <button onClick={onAdd} className="mt-6 rounded-full bg-[#3e7163] px-5 py-3 text-sm font-semibold text-[#fbf8f0] hover:bg-[#315f53]" data-testid="button-empty-add-item">Add your first item</button>}
  </div>;
}

function ItemSkeleton() {
  return <div className="mt-5 space-y-4" aria-label="Loading pantry items" data-testid="loading-pantry-items">{[0, 1, 2].map((n) => <div key={n} className="flex items-center gap-4 border-b border-[#e6dfd1] py-4"><div className="h-12 w-12 animate-pulse rounded-[17px] bg-[#e6e2d6]" /><div className="flex-1"><div className="h-4 w-36 animate-pulse rounded bg-[#e6e2d6]" /><div className="mt-2 h-3 w-52 animate-pulse rounded bg-[#ebe7dc]" /></div></div>)}</div>;
}

function ErrorPanel({ retry }: { retry: () => void }) {
  return <div className="mt-7 rounded-[26px] border border-[#ead3c9] bg-[#faf0e9] px-6 py-12 text-center" data-testid="error-pantry"><CircleAlert className="mx-auto text-[#ad5749]" size={25} /><h3 className="mt-3 font-display text-2xl text-[#633f37]">We couldn’t reach your pantry</h3><p className="mt-2 text-sm text-[#8a6c61]">Your items are still yours. Try again in a moment.</p><button onClick={retry} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#9a5949] px-5 py-2.5 text-sm font-semibold text-white" data-testid="button-retry-pantry"><RefreshCw size={15} /> Try again</button></div>;
}

function AccountError({ retry }: { retry: () => void }) {
  return <main className="flex min-h-[100dvh] items-center justify-center bg-[#f5f1e7] px-5" data-testid="error-account">
    <div className="max-w-[400px] text-center"><CircleAlert className="mx-auto text-[#ad5749]" size={26} /><h1 className="mt-4 font-display text-3xl text-[#30483d]">Your account didn’t load</h1><p className="mt-2 text-sm leading-6 text-[#7f897d]">We couldn’t connect to your pantry profile just now.</p><button onClick={retry} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#3e7163] px-5 py-3 text-sm font-semibold text-[#fbf8f0]" data-testid="button-retry-account"><RefreshCw size={15} /> Try again</button></div>
  </main>;
}

function AdminPage() {
  const [search, setSearch] = useState('');
  const query = useListAdminItems({ query: { queryKey: getListAdminItemsQueryKey() } });
  const me = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const all = query.data ?? [];
  const filtered = all.filter((item) => `${item.name} ${item.createdBy}`.toLowerCase().includes(search.toLowerCase()));
  const expiring = all.filter((item) => daysUntil(item.expiresOn) >= 0 && daysUntil(item.expiresOn) <= 3).length;
  return <AppShell userId={me.data?.id} role={me.data?.role}>
    <div className="mx-auto max-w-[1100px] px-5 pb-16 pt-8 md:px-10 md:pt-12">
      <div><p className="font-mono-data text-[11px] uppercase tracking-[.16em] text-[#789083]">Administrator view</p><h1 className="mt-2 font-display text-5xl tracking-[-.055em] text-[#253a35] md:text-6xl">All pantry items</h1><p className="mt-3 text-[#6c7b71]">A shared view of what’s being kept across the pantry.</p></div>
      <div className="mt-9 grid gap-3 sm:grid-cols-3"><SummaryTile label="All items" value={String(all.length)} note="across members" icon={<Box size={18} />} /><SummaryTile label="Use soon" value={String(expiring)} note="within 3 days" icon={<Clock3 size={18} />} tone="warm" /><SummaryTile label="Access" value="Admin" note="full inventory view" icon={<ShieldCheck size={18} />} tone="soft" /></div>
      <div className="mt-10 flex flex-col justify-between gap-4 border-b border-[#ddd5c5] pb-4 sm:flex-row sm:items-end"><div><h2 className="font-display text-[30px] tracking-[-.04em] text-[#2d433a]">Inventory</h2><p className="mt-1 text-sm text-[#7b857a]">Items are grouped by their owner in the list.</p></div><label className="flex w-full items-center gap-2 rounded-full border border-[#ddd5c5] bg-[#fbf8f0] px-4 py-2.5 text-[#829087] sm:max-w-[270px]"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items or owners" className="w-full bg-transparent text-sm text-[#344b40] outline-none placeholder:text-[#a2a89d]" data-testid="input-admin-search" /></label></div>
      {query.isLoading ? <ItemSkeleton /> : query.isError ? <ErrorPanel retry={() => void query.refetch()} /> : filtered.length === 0 ? <div className="mt-7 rounded-[28px] border border-dashed border-[#d5cebd] bg-[#f8f5ec] px-6 py-14 text-center" data-testid="empty-admin-items"><Box className="mx-auto text-[#789083]" size={24} /><h3 className="mt-3 font-display text-2xl text-[#30483d]">{search ? 'No matching items' : 'No pantry items yet'}</h3><p className="mt-2 text-sm text-[#7f897d]">{search ? 'Adjust your search and look again.' : 'Items added by members will appear here.'}</p></div> : (
        <div className="mt-5 overflow-x-auto rounded-[22px] border border-[#e0d9c9] bg-[#fbf8f0]">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead><tr className="border-b border-[#e5dece] text-[10px] uppercase tracking-[.14em] text-[#92998c]"><th className="px-5 py-4 font-semibold">Item</th><th className="px-5 py-4 font-semibold">Quantity</th><th className="px-5 py-4 font-semibold">Use by</th><th className="px-5 py-4 font-semibold">Owner</th><th className="px-5 py-4 font-semibold">Added</th></tr></thead>
            <tbody>{filtered.map((item) => <tr key={item.id} className="border-b border-[#eee9de] last:border-0 hover:bg-[#f8f5ec]" data-testid={`row-admin-item-${item.id}`}><td className="px-5 py-4 font-semibold text-[#354a40]">{item.name}<div className="mt-1"><ExpiryBadge urgency={daysUntil(item.expiresOn) < 0 ? 'past' : daysUntil(item.expiresOn) <= 3 ? 'soon' : 'fresh'} days={daysUntil(item.expiresOn)} /></div></td><td className="px-5 py-4 font-mono-data text-sm text-[#64766a]">{item.quantity}</td><td className="px-5 py-4 text-sm text-[#64766a]">{formatDate(item.expiresOn)}</td><td className="max-w-[200px] truncate px-5 py-4 font-mono-data text-xs text-[#849084]">{item.createdBy}</td><td className="px-5 py-4 text-sm text-[#7b857a]">{formatDate(item.createdAt)}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  </AppShell>;
}

function AccessDenied() {
  const { isLoaded, isSignedIn } = useAuth();
  if (isLoaded && !isSignedIn) return <Redirect to="/sign-in" />;
  return <main className="grain flex min-h-[100dvh] items-center justify-center bg-[#f5f1e7] px-5 py-12">
    <div className="w-full max-w-[520px] text-center"><div className="mb-10 flex justify-center"><Brand /></div><span className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-[#f1e6d0] text-[#94733d]"><LockKeyhole size={25} /></span><p className="mt-7 font-mono-data text-[10px] uppercase tracking-[.16em] text-[#8b927f]">A small detour</p><h1 className="mt-3 font-display text-5xl tracking-[-.055em] text-[#253a35]">This shelf is reserved.</h1><p className="mx-auto mt-4 max-w-[390px] text-[15px] leading-7 text-[#6f7c72]">Your account doesn’t have administrator access to the shared inventory. Your personal pantry is still right where you left it.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/pantry" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3e7163] px-6 py-3.5 text-sm font-semibold text-[#fbf8f0] hover:bg-[#315f53]" data-testid="link-return-pantry"><ArrowLeft size={16} /> Back to my pantry</Link><Link href="/" className="inline-flex items-center justify-center rounded-full border border-[#d9d1c1] px-6 py-3.5 text-sm font-semibold text-[#52695d] hover:bg-[#ebe7dc]" data-testid="link-access-home">Go home</Link></div></div>
  </main>;
}

function NotFound() {
  return <main className="flex min-h-[100dvh] items-center justify-center bg-[#f5f1e7] px-5"><div className="text-center"><p className="font-mono-data text-xs uppercase tracking-[.18em] text-[#8b927f]">404 · Not on this shelf</p><h1 className="mt-3 font-display text-5xl text-[#253a35]">That page wandered off.</h1><Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#3e7163]" data-testid="link-not-found-home">Return to the kitchen <ArrowRight size={15} /></Link></div></main>;
}

function AppLoading({ label }: { label: string }) {
  return <main className="flex min-h-[100dvh] items-center justify-center bg-[#f5f1e7] px-5" data-testid="loading-app"><div className="w-full max-w-[340px] text-center"><span className="mx-auto block h-12 w-12 animate-pulse rounded-[17px] bg-[#dfe8dd]" /><p className="mt-5 font-display text-2xl text-[#385247]">{label}</p><div className="mx-auto mt-5 h-2 w-full overflow-hidden rounded-full bg-[#e7e2d6]"><div className="h-full w-2/3 animate-pulse rounded-full bg-[#8dab97]" /></div></div></main>;
}

function daysUntil(dateString: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateString.slice(0, 10)}T00:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}
function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function App() {
  if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
  return <QueryClientProvider client={queryClient}><WouterRouter base={basePath}><ClerkRoutes /></WouterRouter></QueryClientProvider>;
}

export default App;
