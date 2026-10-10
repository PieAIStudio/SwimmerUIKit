import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { DropletSurface } from '../../controls/DropletSurface/DropletSurface';
import { GameButton } from '../../controls/GameButton/GameButton';
import { GameTabs, type GameTabItem } from '../../controls/GameTabs/GameTabs';
import { type ActionElement } from '../../controls/NativeAction/NativeAction';
import { GameBadge } from '../../feedback/GameBadge/GameBadge';
import { LiquidPopover } from '../../presence/LiquidPopover/LiquidPopover';
import { controlHue } from '../../tokens/hue';
import { GameAvatar } from '../GameAvatar/GameAvatar';

export interface GameAccountProduct {
  id: string;
  name: string;
  description?: string;
  href: string;
  /** The product that is showing this menu. It is not a link. */
  current?: boolean;
}

export interface GameAccountMenuLabels {
  /** Accessible name of the trigger, final string from the product, e.g. "账号：小鱼". */
  trigger: string;
  /** First tab: the current product's own content, usually the product name. */
  siteTab: string;
  productsTab: string;
  accountTab: string;
  /** Badge on the current product. */
  current: string;
  manage: string;
  signOut: string;
}

export interface GameAccountMenuProps {
  user: { name: string; email?: string; avatarUrl?: string };
  labels: GameAccountMenuLabels;
  /** Product-owned content for the first tab; the tab is omitted when absent. */
  site?: ReactNode;
  /** All products; the tab is omitted when empty. */
  products?: readonly GameAccountProduct[];
  /** The account center page (security, profile, sign out everywhere). */
  accountHref: string;
  onSignOut: () => void | Promise<void>;
  /** True while the product signs out; the button shows the pending state. */
  signingOut?: boolean;
  defaultTab?: 'site' | 'products' | 'account';
  className?: string;
}

type AccountTab = 'site' | 'products' | 'account';

/** The trigger shows at most this many characters; the full name stays in the label. */
const TRIGGER_NAME_LIMIT = 12;

function triggerName(name: string): string {
  const characters = Array.from(name);
  return characters.length > TRIGGER_NAME_LIMIT
    ? `${characters.slice(0, TRIGGER_NAME_LIMIT).join('')}…`
    : name;
}

/** Only https images are rendered; anything else falls back to initials. */
function avatarSource(url: string | undefined): string | undefined {
  return url?.startsWith('https:') ? url : undefined;
}

/**
 * A presentation-only account menu. The product owns the user, the product
 * list, the destinations and sign-out; this component never fetches or stores.
 */
export function GameAccountMenu({
  user,
  labels,
  site,
  products = [],
  accountHref,
  onSignOut,
  signingOut = false,
  defaultTab,
  className,
}: GameAccountMenuProps): ReactNode {
  const trigger = useRef<ActionElement | null>(null);
  const [open, setOpen] = useState(false);
  const hasSite = site !== undefined && site !== null && typeof site !== 'boolean';
  const tabs: AccountTab[] = [
    ...(hasSite ? (['site'] as const) : []),
    ...(products.length > 0 ? (['products'] as const) : []),
    'account',
  ];
  const initialTab = defaultTab && tabs.includes(defaultTab) ? defaultTab : (tabs[0] ?? 'account');
  const avatar = avatarSource(user.avatarUrl);
  // Pass src only when it is a safe https image (exactOptionalPropertyTypes).
  const avatarImage = avatar ? { src: avatar } : {};
  return (
    <div className={['game-ui-account-menu', className].filter(Boolean).join(' ')}>
      <GameButton
        ref={trigger}
        size="sm"
        className="game-ui-account-menu-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={labels.trigger}
        onClick={() => setOpen((current) => !current)}
      >
        {/* Decorative: the trigger is named by aria-label, so the image is not announced. */}
        <span aria-hidden="true" className="game-ui-account-menu-avatar">
          <GameAvatar name={user.name} size="sm" {...avatarImage} />
        </span>
        <span className="game-ui-account-menu-trigger-name">{triggerName(user.name)}</span>
      </GameButton>
      <LiquidPopover
        open={open}
        onOpenChange={setOpen}
        source={trigger}
        title={<span className="game-ui-account-menu-name">{user.name}</span>}
        width={360}
      >
        <AccountPanel
          avatarImage={avatarImage}
          initialTab={initialTab}
          labels={labels}
          products={products}
          accountHref={accountHref}
          onSignOut={onSignOut}
          signingOut={signingOut}
          site={hasSite ? site : null}
          tabs={tabs}
          user={user}
        />
      </LiquidPopover>
    </div>
  );
}

interface AccountPanelProps {
  avatarImage: { src?: string };
  initialTab: AccountTab;
  labels: GameAccountMenuLabels;
  products: readonly GameAccountProduct[];
  accountHref: string;
  onSignOut: () => void | Promise<void>;
  signingOut: boolean;
  site: ReactNode;
  tabs: readonly AccountTab[];
  user: GameAccountMenuProps['user'];
}

/** Mounted only while the popover is open, so the chosen tab resets on reopen. */
function AccountPanel({
  avatarImage,
  initialTab,
  labels,
  products,
  accountHref,
  onSignOut,
  signingOut,
  site,
  tabs,
  user,
}: AccountPanelProps): ReactNode {
  const baseId = useId();
  const [tab, setTab] = useState<AccountTab>(initialTab);
  // Guards a second click that lands before the product's pending state renders.
  const inFlight = useRef(false);
  useEffect(() => {
    if (!signingOut) inFlight.current = false;
  }, [signingOut]);
  const signOut = () => {
    if (signingOut || inFlight.current) return;
    inFlight.current = true;
    void new Promise<void>((resolve) => resolve(onSignOut())).finally(() => {
      inFlight.current = false;
    });
  };
  // A lone account tab is shown without a tab strip, so it never claims a tab role.
  const paged = tabs.length > 1;
  const tabLabel: Record<AccountTab, string> = {
    site: labels.siteTab,
    products: labels.productsTab,
    account: labels.accountTab,
  };
  const tabItems: GameTabItem[] = tabs.map((value) => ({
    id: value,
    label: tabLabel[value],
    panelId: `${baseId}-panel-${value}`,
  }));
  const section = (value: AccountTab, content: ReactNode) => (
    <div
      className="game-ui-account-menu-section"
      hidden={paged && tab !== value}
      id={`${baseId}-panel-${value}`}
      role={paged ? 'tabpanel' : undefined}
      aria-labelledby={paged ? `${baseId}-tabs-${value}` : undefined}
    >
      {content}
    </div>
  );
  return (
    <div className="game-ui-account-menu-panel">
      <div className="game-ui-account-menu-identity">
        {/* Decorative: the dialog is named by the heading that shows the same name. */}
        <span aria-hidden="true" className="game-ui-account-menu-avatar">
          <GameAvatar name={user.name} size="md" {...avatarImage} />
        </span>
        {user.email ? <p className="game-ui-account-menu-email">{user.email}</p> : null}
      </div>
      {paged ? (
        <GameTabs
          id={`${baseId}-tabs`}
          aria-label={labels.trigger}
          activeId={tab}
          onSelect={(id) => setTab(id as AccountTab)}
          tabs={tabItems}
        />
      ) : null}
      {tabs.includes('site') ? section('site', site) : null}
      {tabs.includes('products')
        ? section(
            'products',
            <ul className="game-ui-account-menu-products">
              {products.map((product) => (
                <li key={product.id}>
                  <ProductRow currentLabel={labels.current} product={product} />
                </li>
              ))}
            </ul>,
          )
        : null}
      {section(
        'account',
        <div className="game-ui-account-menu-actions">
          <GameButton fullWidth href={accountHref} variant="secondary">
            {labels.manage}
          </GameButton>
          <GameButton fullWidth pending={signingOut} onClick={signOut} variant="secondary">
            {labels.signOut}
          </GameButton>
        </div>,
      )}
    </div>
  );
}

function ProductRow({
  currentLabel,
  product,
}: {
  currentLabel: string;
  product: GameAccountProduct;
}): ReactNode {
  const link = useRef<HTMLAnchorElement>(null);
  const copy = (
    <span className="game-ui-list-row-copy">
      <span className="game-ui-list-row-title">{product.name}</span>
      {product.description ? (
        <span className="game-ui-list-row-description">{product.description}</span>
      ) : null}
    </span>
  );
  // The same list-row paint as GameListRow, with a real link as the row's main
  // control. GameListRow itself offers no link, so the tokens are shared instead.
  if (product.current)
    return (
      <div
        className="game-ui-list-row game-ui-account-menu-product"
        data-game-ui-paint=""
        style={controlHue()}
      >
        <DropletSurface static />
        <div className="game-ui-list-row-main" aria-current="true">
          {copy}
          <GameBadge>{currentLabel}</GameBadge>
        </div>
      </div>
    );
  return (
    <div
      className="game-ui-list-row game-ui-account-menu-product"
      data-game-ui-paint=""
      style={controlHue()}
    >
      <DropletSurface pressTarget={link} />
      <a className="game-ui-list-row-main" href={product.href} ref={link}>
        {copy}
      </a>
    </div>
  );
}
