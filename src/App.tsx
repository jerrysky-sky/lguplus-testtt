import { useEffect, useMemo, useState, type FormEvent } from "react"

const assetPathPrefix = "/assets"
const logoAsset = `${assetPathPrefix}/2af41.svg`
const arrowAsset = `${assetPathPrefix}/25d10.svg`
const bulletAsset = `${assetPathPrefix}/84eaf.svg`

type Route =
  | "plans"
  | "detail"
  | "apply"
  | "processing"
  | "failure"
  | "complete"
type Filter = "데이터 많이" | "가성비" | "구독 포함" | "통화 많이"

type Plan = {
  id: string
  name: string
  description: string
  price: string
  priceValue: string
  original?: string
  discount?: string
  promotion?: string
  filters: Filter[]
}

const filters: Filter[] = ["데이터 많이", "가성비", "구독 포함", "통화 많이"]

const plans: Plan[] = [
  {
    id: "unlimited",
    name: "넉넉 무제한",
    description: "데이터 무제한 · 통화 무제한 · 넷플릭스 포함",
    price: "월 85,000원",
    priceValue: "85,000원",
    original: "월 100,000원",
    discount: "15%",
    promotion: "24개월 할인 프로모션",
    filters: ["데이터 많이", "구독 포함", "통화 많이"],
  },
  {
    id: "standard-110",
    name: "스탠다드 110",
    description: "데이터 110GB · 통화 무제한",
    price: "월 69,000원",
    priceValue: "69,000원",
    original: "월 78,000원",
    discount: "12%",
    promotion: "24개월 할인 프로모션",
    filters: ["데이터 많이", "통화 많이"],
  },
  {
    id: "light-30",
    name: "라이트 30",
    description: "데이터 30GB · 통화 무제한",
    price: "월 49,000원",
    priceValue: "49,000원",
    filters: ["데이터 많이", "가성비", "통화 많이"],
  },
  {
    id: "slim-10",
    name: "슬림 10",
    description: "데이터 10GB · 통화 무제한",
    price: "월 39,000원",
    priceValue: "39,000원",
    original: "월 43,000원",
    discount: "10%",
    filters: ["데이터 많이", "가성비", "통화 많이"],
  },
]

function getRoute(): Route {
  const path = window.location.pathname
  if (path === "/complete") return "complete"
  if (path === "/failure") return "failure"
  if (path === "/processing") return "processing"
  if (path === "/apply") return "apply"
  if (path.startsWith("/plans/")) return "detail"
  return "plans"
}

function navigate(path: string) {
  window.history.pushState({}, "", path)
  window.dispatchEvent(new PopStateEvent("popstate"))
}

function getInitialPlan() {
  const pathId = window.location.pathname.match(/^\/plans\/([^/]+)$/)?.[1]
  const savedId = window.sessionStorage.getItem("selected-plan")
  return plans.find((plan) => plan.id === pathId || plan.id === savedId) ?? plans[0]
}

function ActionButton({
  children,
  variant = "primary",
  size = "xl",
  type = "button",
  onClick,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary"
  size?: "sm" | "xl"
  type?: "button" | "submit"
  onClick?: () => void
}) {
  return (
    <button
      className={`action-button action-button--${variant} action-button--${size} font-regular`}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  )
}

function Header({
  root = false,
  title,
  onBack,
}: {
  root?: boolean
  title: string
  onBack?: () => void
}) {
  return (
    <div className={`header ${root ? "header--root" : ""}`}>
      {root ? (
        <>
          <div className="header__root-title font-bold">{title}</div>
          <img
            alt="U+"
            className="logo"
            height="24"
            src={logoAsset}
            width="32"
          />
        </>
      ) : (
        <>
          <button
            aria-label="뒤로 가기"
            className="icon-button"
            onClick={onBack}
            type="button"
          >
            <img alt="" height="24" src={arrowAsset} width="24" />
          </button>
          <div className="header__title font-medium">{title}</div>
          <div aria-hidden="true" className="header__spacer" />
        </>
      )}
    </div>
  )
}

function Tag() {
  return <div className="tag font-bold">추천</div>
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      aria-pressed={active}
      className={`filter-chip ${
        active ? "filter-chip--selected font-regular" : "font-medium"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function PlanCard({ plan, onOpen }: { plan: Plan onOpen: () => void }) {
  return (
    <article className="plan-card">
      <Tag />
      <div className="plan-card__name font-bold">{plan.name}</div>
      <div className="plan-card__description font-medium">
        {plan.description}
      </div>
      <div className="plan-card__bottom">
        <div className="plan-card__price-group">
          <div className="plan-card__current font-bold">
            {plan.discount && (
              <span className="text-accent">{plan.discount}</span>
            )}
            <span>{plan.price}</span>
          </div>
          {plan.original && (
            <div className="plan-card__original font-medium">
              {plan.original}
            </div>
          )}
          {plan.promotion && (
            <div className="promotion-chip font-bold">{plan.promotion}</div>
          )}
        </div>
        <ActionButton onClick={onOpen} size="sm" variant="secondary">
          자세히
        </ActionButton>
      </div>
    </article>
  )
}

function PlansScreen({ onSelect }: { onSelect: (plan: Plan) => void }) {
  const [selectedFilters, setSelectedFilters] = useState<Filter[]>([
    "데이터 많이",
  ])
  const visiblePlans = useMemo(
    () =>
      selectedFilters.length === 0
        ? plans
        : plans.filter((plan) =>
            selectedFilters.some((filter) => plan.filters.includes(filter)),
          ),
    [selectedFilters],
  )

  function toggleFilter(filter: Filter) {
    setSelectedFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter],
    )
  }

  return (
    <div className="screen screen--plans">
      <Header root title="요금제" />
      <main className="plans-content">
        <section className="intro">
          <div className="intro__title font-bold">
            나에게 맞는 요금제를
            <br />
            골라보세요
          </div>
          <div className="intro__description font-medium">
            중요하게 보는 조건을 고르면 추천해 드려요
          </div>
        </section>

        <div aria-label="요금제 조건" className="filters">
          {filters.map((filter) => (
            <FilterChip
              active={selectedFilters.includes(filter)}
              key={filter}
              onClick={() => toggleFilter(filter)}
            >
              {filter}
            </FilterChip>
          ))}
        </div>

        <section className="plan-list">
          <div className="result-count font-medium">
            추천순 · {visiblePlans.length}개
          </div>
          {visiblePlans.length > 0 ? (
            visiblePlans.map((plan) => (
              <PlanCard
                key={plan.id}
                onOpen={() => onSelect(plan)}
                plan={plan}
              />
            ))
          ) : (
            <div className="empty-state font-medium">
              선택한 조건에 맞는 요금제가 없어요.
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function InfoRow({
  label,
  value,
  benefit = false,
}: {
  label: string
  value: string
  benefit?: boolean
}) {
  return (
    <div className={`info-row ${benefit ? "info-row--benefit" : ""}`}>
      {benefit && <img alt="" height="6" src={bulletAsset} width="6" />}
      <div className="info-row__label font-medium">{label}</div>
      <div
        className={`info-row__value ${
          benefit ? "font-regular text-accent" : "font-regular"
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function BottomCta({
  amount,
  children,
}: {
  amount?: string
  children: React.ReactNode
}) {
  return (
    <div className={`bottom-cta ${amount ? "bottom-cta--price" : ""}`}>
      {amount && (
        <div className="amount-row">
          <div className="amount-row__label font-medium">월 납부 금액</div>
          <div className="amount-row__value font-bold">{amount}</div>
        </div>
      )}
      {children}
    </div>
  )
}

function DetailScreen({
  plan,
  onBack,
  onApply,
}: {
  plan: Plan
  onBack: () => void
  onApply: () => void
}) {
  return (
    <div className="screen screen--fixed-cta">
      <Header onBack={onBack} title="요금제 상세" />
      <main className="detail-content">
        <section className="detail-title">
          <Tag />
          <div className="detail-title__name font-bold">{plan.name}</div>
          <div className="detail-title__description font-medium">
            영상·게임을 하루 종일 해도 걱정 없어요
          </div>
        </section>

        <section className="price-card">
          <div className="price-card__label font-medium">월 요금</div>
          <div className="price-card__current font-bold">
            <span>{plan.priceValue}</span>
            {plan.discount && (
              <span className="text-accent">{plan.discount}</span>
            )}
          </div>
          <div className="price-card__note font-medium">
            {plan.original ? `${plan.original.replace("월 ", "")}/월 · ` : ""}
            {plan.promotion ? `${plan.promotion} 적용` : "할인 없이 이용"}
          </div>
        </section>

        <section className="info-section">
          <div className="section-title font-regular">기본 제공</div>
          <InfoRow
            label="데이터"
            value={
              plan.id === "unlimited"
                ? "무제한"
                : plan.description.split(" · ")[0].replace("데이터 ", "")
            }
          />
          <InfoRow label="통화" value="집·이동전화 무제한" />
          <InfoRow label="문자" value="기본 제공" />
        </section>

        <section className="info-section">
          <div className="section-title font-regular">포함 혜택</div>
          <InfoRow benefit label="넷플릭스 스탠다드" value="포함" />
          <InfoRow benefit label="유튜브 프리미엄" value="포함" />
        </section>
      </main>
      <BottomCta amount={plan.price}>
        <ActionButton onClick={onApply}>구독 신청하기</ActionButton>
      </BottomCta>
    </div>
  )
}

function ApplyScreen({
  plan,
  onBack,
  onSubmit,
}: {
  plan: Plan
  onBack: () => void
  onSubmit: () => void
}) {
  const [name, setName] = useState("김유플")
  const [phone, setPhone] = useState("010-1234-5678")
  const [agreed, setAgreed] = useState(true)
  const [error, setError] = useState("")

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !/^010-\d{4}-\d{4}$/.test(phone) || !agreed) {
      setError("이름, 휴대폰 번호와 필수 동의를 확인해주세요.")
      return
    }
    onSubmit()
  }

  return (
    <form className="screen screen--fixed-cta" onSubmit={submit}>
      <Header onBack={onBack} title="구독 신청" />
      <main className="apply-content">
        <div className="apply-title font-bold">신청 정보를 입력해주세요</div>
        <section className="info-section summary-section">
          <InfoRow label="선택한 요금제" value={plan.name} />
          <InfoRow label="월 요금" value={plan.priceValue} />
        </section>

        <div className="field-group">
          <label className="field-label font-medium" htmlFor="name">
            이름
          </label>
          <input
            className="text-field font-medium"
            id="name"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </div>
        <div className="field-group">
          <label className="field-label font-medium" htmlFor="phone">
            휴대폰 번호
          </label>
          <input
            className="text-field font-medium"
            id="phone"
            inputMode="tel"
            onChange={(event) => setPhone(event.target.value)}
            value={phone}
          />
        </div>

        <label className="agreement font-medium">
          <input
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            type="checkbox"
          />
          <span className="checkbox" aria-hidden="true">
            ✓
          </span>
          <span>[필수] 개인정보 수집·이용에 동의합니다</span>
        </label>
        {error && <div className="error-message font-medium">{error}</div>}
      </main>
      <BottomCta>
        <ActionButton type="submit">신청하기</ActionButton>
      </BottomCta>
    </form>
  )
}

function ProcessingScreen({
  onComplete,
  onFailure,
}: {
  onComplete: () => void
  onFailure: () => void
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (navigator.onLine) {
        onComplete()
      } else {
        onFailure()
      }
    }, 900)

    return () => window.clearTimeout(timer)
  }, [onComplete, onFailure])

  return (
    <div className="screen status-screen">
      <div aria-hidden="true" className="spinner" />
      <div className="status-title font-bold">신청 정보를 처리하고 있어요</div>
      <div className="status-description font-medium">
        잠시만 기다려주세요. 신청을 안전하게 접수하고 있어요.
      </div>
    </div>
  )
}

function FailureScreen({
  onRetry,
  onPlans,
}: {
  onRetry: () => void
  onPlans: () => void
}) {
  return (
    <div className="screen screen--fixed-cta">
      <Header onBack={onRetry} title="신청 안내" />
      <main className="status-screen status-screen--content">
        <div className="failure-mark font-bold">!</div>
        <div className="status-title font-bold">신청을 완료하지 못했어요</div>
        <div className="status-description font-medium">
          네트워크 상태를 확인한 뒤 다시 시도해주세요.
        </div>
      </main>
      <BottomCta>
        <div className="failure-actions">
          <ActionButton onClick={onPlans} size="xl" variant="secondary">
            요금제 보기
          </ActionButton>
          <ActionButton onClick={onRetry}>다시 시도하기</ActionButton>
        </div>
      </BottomCta>
    </div>
  )
}

function CompleteScreen({ plan, onPlans }: { plan: Plan onPlans: () => void }) {
  return (
    <div className="screen screen--fixed-cta">
      <Header onBack={onPlans} title="신청 완료" />
      <main className="complete-content">
        <section className="complete-hero">
          <div className="done-mark font-bold">✓</div>
          <div className="complete-title font-bold">구독 신청이 완료됐어요</div>
          <div className="complete-description font-medium">
            개통 안내는 문자로 보내드려요
          </div>
        </section>
        <section className="info-section">
          <div className="section-title font-regular">신청 내역</div>
          <InfoRow label="신청 번호" value="2026-1013-0024" />
          <InfoRow label="요금제" value={plan.name} />
          <InfoRow label="월 요금" value={plan.priceValue} />
          <InfoRow label="신청 일시" value="10월 13일 14:02" />
          <InfoRow label="신청자" value="김*플 · 010-****-5678" />
        </section>
      </main>
      <BottomCta>
        <ActionButton onClick={onPlans}>요금제 더 보기</ActionButton>
      </BottomCta>
    </div>
  )
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute)
  const [selectedPlan, setSelectedPlan] = useState(getInitialPlan)

  useEffect(() => {
    const syncRoute = () => setRoute(getRoute())
    window.addEventListener("popstate", syncRoute)
    if (window.location.pathname === "/") navigate("/plans")
    return () => window.removeEventListener("popstate", syncRoute)
  }, [])

  if (route === "detail") {
    return (
      <DetailScreen
        onApply={() => navigate("/apply")}
        onBack={() => navigate("/plans")}
        plan={selectedPlan}
      />
    )
  }

  if (route === "apply") {
    return (
      <ApplyScreen
        onBack={() => navigate(`/plans/${selectedPlan.id}`)}
        onSubmit={() => navigate("/processing")}
        plan={selectedPlan}
      />
    )
  }

  if (route === "processing") {
    return (
      <ProcessingScreen
        onComplete={() => navigate("/complete")}
        onFailure={() => navigate("/failure")}
      />
    )
  }

  if (route === "failure") {
    return (
      <FailureScreen
        onPlans={() => navigate("/plans")}
        onRetry={() => navigate("/apply")}
      />
    )
  }

  if (route === "complete") {
    return (
      <CompleteScreen onPlans={() => navigate("/plans")} plan={selectedPlan} />
    )
  }

  return (
    <PlansScreen
      onSelect={(plan) => {
        setSelectedPlan(plan)
        window.sessionStorage.setItem("selected-plan", plan.id)
        navigate(`/plans/${plan.id}`)
      }}
    />
  )
}
