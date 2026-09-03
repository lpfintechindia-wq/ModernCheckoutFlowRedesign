import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin, Tag, ChevronRight, ChevronDown, Check, X,
  Copy, Download, Share2, RefreshCw, CreditCard, Building2,
  Wallet, Calendar, Eye, EyeOff, Home,
  Smartphone, Lock, Gift, Truck, Edit3,
  Info, ArrowLeft, Shield, Clock, Star, UserCircle2,
  MoreVertical, Plus, ShoppingCart,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const MERCHANT = {
  name: "Aqualogica",
  tagline: "A Honasa Consumer Brand",
  letter: "A",
  brandColor: "#1a7a5e",
  itemCount: 2,
  mrp: 599,
  discount: 89.85,
  couponDiscount: 25.48,
  amount: 483.69,
  displayAmount: 509.15,
  orderId: "ORD-2024-89234",
};

const DELIVERY = {
  name: "Akshansh Ji",
  address: "3ab Sharma Colony, Nandpuri, Sodala, Jaipur",
  state: "Rajasthan, 302001",
  phone: "+91 7222017016",
  email: "akshanshkumawat4112@gma...",
  shipping: "Free",
};

const AVAILABLE_COUPONS = [
  { code: "AQAUTO15", desc: "15% off on all products", savings: 89.85, auto: true },
  { code: "SAVE50",   desc: "₹50 off on orders above ₹500", savings: 50,    auto: false },
  { code: "FIRST10",  desc: "10% off on your first order",  savings: 50.92, auto: false },
  { code: "FREESHIP", desc: "Free shipping on all orders",  savings: 40,    auto: false },
];

const QUICK_BANKS = [
  { id: "hdfc",  name: "HDFC Bank",  abbr: "HD", color: "#004C97" },
  { id: "icici", name: "ICICI Bank", abbr: "IC", color: "#B5121B" },
  { id: "sbi",   name: "SBI",        abbr: "SB", color: "#1E40AF" },
  { id: "axis",  name: "Axis Bank",  abbr: "AX", color: "#97144D" },
  { id: "kotak", name: "Kotak",      abbr: "KM", color: "#EF3E23" },
  { id: "yes",   name: "YES Bank",   abbr: "YB", color: "#006CB7" },
];

const WALLETS = [
  { id: "paytm",    name: "Paytm Wallet",  balance: "₹245", color: "#00BAF2" },
  { id: "amazon",   name: "Amazon Pay",    balance: "₹500", color: "#FF9900" },
  { id: "mobikwik", name: "MobiKwik",      balance: "₹0",   color: "#50C878" },
  { id: "ola",      name: "Ola Money",     balance: "₹60",  color: "#333333" },
];

const PAY_LATER = [
  { id: "lazypay", name: "LazyPay",          limit: "₹10,000", color: "#FF6B35" },
  { id: "simpl",   name: "Simpl",            limit: "₹8,000",  color: "#6C4DFF" },
  { id: "icici",   name: "ICICI PayLater",   limit: "₹20,000", color: "#B5121B" },
];

const EMI_TENURES = [3, 6, 9, 12, 18, 24];

const UPI_APP_LOGOS = [
  { abbr: "G",  color: "#4285F4", name: "GPay" },
  { abbr: "Pe", color: "#5F259F", name: "PhonePe" },
  { abbr: "P",  color: "#00BAF2", name: "Paytm" },
];

const SAVED_ADDRESSES = [
  {
    id: 0,
    name: "Aditi Agarwal",
    type: "Home",
    line1: "C-49 Dev Nagar Tonk Road Opposite To Kamal And Company",
    line2: "Near Arihant Diagnostic Center, Jaipur, Rajasthan, 302015",
    phone: "+91 8290098401",
    email: "aditi.agarwal256@gmail.com",
  },
  {
    id: 1,
    name: "Aditi Agarwal",
    type: "Home",
    line1: "B-28 Dev Nagar Tonk Road Opposite To Kamal And Company",
    line2: "Near Arihant Diagnostic Centr, Jaipur, Rajasthan, 302018",
    phone: "+91 8290098401",
    email: "aditi.agarwal256@gmail.com",
  },
];

// ── QR Grid ───────────────────────────────────────────────────────────────────

function QRGrid({ size = 21 }: { size?: number }) {
  const cells = useMemo(() => {
    const g: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
    const finder = (sr: number, sc: number) => {
      for (let r = 0; r < 7; r++)
        for (let c = 0; c < 7; c++)
          g[sr + r][sc + c] = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
    };
    finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
    for (let i = 8; i < size - 8; i++) { g[6][i] = i % 2 === 0; g[i][6] = i % 2 === 0; }
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++) {
        const inF = (r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8);
        const inT = (r === 6 && c >= 8 && c < size - 8) || (c === 6 && r >= 8 && r < size - 8);
        if (!inF && !inT) g[r][c] = ((r * 13 + c * 7 + r * c * 3) % 5) < 2;
      }
    return g;
  }, [size]);

  return (
    <div className="p-2 bg-white rounded-xl inline-block border border-gray-100">
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${size}, 7px)`, gap: "1.5px" }}>
        {cells.flatMap((row, r) =>
          row.map((dark, c) => (
            <div key={`${r}-${c}`} style={{ width: 7, height: 7, background: dark ? "#1A1535" : "transparent", borderRadius: 1 }} />
          ))
        )}
      </div>
    </div>
  );
}

// ── Processing ────────────────────────────────────────────────────────────────

function ProcessingScreen({ step }: { step: number }) {
  const steps = ["Initiating payment", "Connecting to bank", "Verifying transaction", "Confirming payment"];
  return (
    <div className="min-h-screen bg-[#EBEBF5] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white rounded-[24px] p-10 shadow-2xl text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-purple-100 border-t-[#6C4DFF]" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#6C4DFF] to-[#8B6FFF] flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Processing Payment</h2>
        <p className="text-gray-500 text-sm mb-8">Please do not close this window</p>
        <div className="space-y-3 text-left">
          {steps.map((s, i) => (
            <motion.div key={s} initial={{ opacity: 0 }} animate={{ opacity: step >= i ? 1 : 0.3 }} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${step > i ? "bg-green-500" : step === i ? "bg-[#6C4DFF]" : "bg-gray-200"}`}>
                {step > i ? <Check className="w-3 h-3 text-white" /> : step === i ? (
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 rounded-full bg-white" />
                ) : <div className="w-2 h-2 rounded-full bg-gray-400" />}
              </div>
              <span className={`text-sm ${step >= i ? "font-medium text-gray-900" : "text-gray-400"}`}>{s}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── Success ───────────────────────────────────────────────────────────────────

function SuccessScreen({ onHome }: { onHome: () => void }) {
  const colors = ["#6C4DFF", "#10B981", "#F97316", "#3B82F6", "#EC4899", "#FBBF24"];
  return (
    <div className="min-h-screen bg-[#EBEBF5] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div key={i} initial={{ y: -20, x: `${(i * 4.3) % 100}vw`, opacity: 1 }} animate={{ y: "110vh", rotate: 540, opacity: 0 }}
            transition={{ duration: 2.5 + (i % 4) * 0.5, delay: i * 0.08, ease: "easeIn" }}
            className="absolute w-2.5 h-2.5 rounded-sm" style={{ background: colors[i % colors.length] }} />
        ))}
      </div>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-[24px] p-8 shadow-2xl border border-green-100 text-center relative z-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10, delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </motion.div>
        <p className="text-green-600 font-semibold text-sm mb-1">Payment Successful</p>
        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">₹{MERCHANT.amount.toFixed(2)}</h2>
        <p className="text-gray-500 text-sm mt-1 mb-2">Paid to {MERCHANT.name}</p>
        <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Tag className="w-3 h-3" />
          You saved ₹{(MERCHANT.discount + MERCHANT.couponDiscount).toFixed(2)} on this order
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 text-left mb-6 space-y-2.5">
          {[
            { label: "Transaction ID", value: "TXN892347823" },
            { label: "Order ID",       value: MERCHANT.orderId },
            { label: "Delivered to",   value: DELIVERY.name + ", " + DELIVERY.address.split(",")[0] },
            { label: "Payment Method", value: "UPI · Google Pay" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-500 text-xs">{label}</span>
              <span className="text-gray-900 text-xs font-semibold text-right max-w-[55%] truncate">{value}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2.5">
          <button className="w-full py-3.5 bg-gradient-to-r from-[#6C4DFF] to-[#8B6FFF] text-white font-semibold rounded-2xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Download Receipt
          </button>
          <div className="flex gap-2.5">
            <button className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium rounded-2xl flex items-center justify-center gap-1.5 text-sm">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button onClick={onHome} className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium rounded-2xl flex items-center justify-center gap-1.5 text-sm">
              <Home className="w-4 h-4" /> Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Failed ────────────────────────────────────────────────────────────────────

function FailedScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#EBEBF5] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white rounded-[24px] p-8 shadow-2xl border border-red-100 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10 }}
          className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center">
          <X className="w-10 h-10 text-white" strokeWidth={3} />
        </motion.div>
        <p className="text-red-500 font-semibold text-sm mb-1">Payment Failed</p>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">₹{MERCHANT.amount.toFixed(2)}</h2>
        <p className="text-gray-500 text-sm mb-8">Transaction could not be completed.<br />Please try a different method.</p>
        <button onClick={onRetry} className="w-full py-3.5 bg-gradient-to-r from-[#6C4DFF] to-[#8B6FFF] text-white font-semibold rounded-2xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
        <button onClick={onRetry} className="w-full py-3 text-[#6C4DFF] font-medium text-sm mt-2">Switch Payment Method</button>
      </motion.div>
    </div>
  );
}

// ── Option Row ────────────────────────────────────────────────────────────────

interface OptionRowProps {
  icon: React.ElementType;
  label: string;
  badge?: string;
  sublabel?: string;
  savingsBadge?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function OptionRow({ icon: Icon, label, badge, sublabel, savingsBadge, isOpen, onToggle, children }: OptionRowProps) {
  return (
    <div className={`border-b border-gray-100 last:border-b-0 transition-colors ${isOpen ? "bg-purple-50/40" : "bg-white hover:bg-gray-50/60"}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-5 py-3.5 text-left">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? "bg-[#6C4DFF]" : "bg-purple-50"}`}>
          <Icon className={`w-4 h-4 ${isOpen ? "text-white" : "text-[#6C4DFF]"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">{label}</span>
            {badge && <span className="text-[10px] font-semibold bg-purple-100 text-[#6C4DFF] px-2 py-0.5 rounded-full">{badge}</span>}
            {savingsBadge && (
              <span className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">{savingsBadge}</span>
            )}
          </div>
          {sublabel && <p className="text-[11px] text-gray-500 mt-0.5">{sublabel}</p>}
        </div>
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}>
            <div className="px-5 pb-5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

type Screen    = "checkout" | "processing" | "success" | "failed";
type RightView = "login" | "otp" | "checkout";
type Section   = "netbanking" | "wallets" | "card" | "upi" | "paylater" | "emi" | "qr" | null;

export default function App() {
  const [screen,         setScreen]         = useState<Screen>("checkout");
  const [rightView,      setRightView]      = useState<RightView>("login");
  const [phone,          setPhone]          = useState("");
  const [sendUpdates,    setSendUpdates]    = useState(true);
  const [otp,            setOtp]            = useState(["", "", "", ""]);
  const [resendTimer,    setResendTimer]    = useState(30);
  const [canResend,      setCanResend]      = useState(false);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const [section,        setSection]        = useState<Section>(null);
  const [orderExpanded,  setOrderExpanded]  = useState(false);
  const [qrRevealed,     setQrRevealed]     = useState(false);
  const [timer,          setTimer]          = useState(899);
  const [processingStep, setProcessingStep] = useState(0);
  const [copied,         setCopied]         = useState(false);
  const [selectedTenure, setSelectedTenure] = useState(6);

  // Delivery / address sheet
  const [editingAddress,    setEditingAddress]    = useState(false);
  const [showAddressSheet,  setShowAddressSheet]  = useState(false);
  const [showAddNewForm,    setShowAddNewForm]     = useState(false);
  const [selectedAddrIdx,   setSelectedAddrIdx]   = useState(0);
  const [newAddr, setNewAddr] = useState({ name:"", phone:"", pincode:"", line1:"", line2:"", city:"", state:"", type:"Home" });

  // Offers
  const [couponInput,     setCouponInput]     = useState("");
  const [appliedCoupon,   setAppliedCoupon]   = useState(AVAILABLE_COUPONS[0]);
  const [showAllCoupons,  setShowAllCoupons]  = useState(false);
  const [couponError,     setCouponError]     = useState("");
  const [couponSuccess,   setCouponSuccess]   = useState(false);

  // Card
  const [cardNum,     setCardNum]     = useState("");
  const [cardExpiry,  setCardExpiry]  = useState("");
  const [cardCVV,     setCardCVV]     = useState("");
  const [cardName,    setCardName]    = useState("");
  const [saveCard,    setSaveCard]    = useState(false);
  const [showCVV,     setShowCVV]     = useState(false);

  // Net banking
  const [bankSearch,  setBankSearch]  = useState("");
  const [upiId,       setUpiId]       = useState("");

  useEffect(() => {
    if (screen !== "checkout") return;
    const id = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(id);
  }, [screen]);

  // OTP resend countdown — only runs when on otp view
  useEffect(() => {
    if (rightView !== "otp") return;
    setResendTimer(30);
    setCanResend(false);
    setOtp(["", "", "", ""]);
    setTimeout(() => otpRefs[0].current?.focus(), 100);
  }, [rightView]);

  useEffect(() => {
    if (rightView !== "otp" || canResend) return;
    if (resendTimer === 0) { setCanResend(true); return; }
    const id = setTimeout(() => setResendTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer, rightView, canResend]);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 3) otpRefs[index + 1].current?.focus();
    // auto-verify when all 4 filled
    if (digit && index === 3 && next.every(d => d !== "")) {
      setTimeout(() => setRightView("checkout"), 400);
    }
  };

  const handleOtpKey = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = "";
      setOtp(next);
      otpRefs[index - 1].current?.focus();
    }
  };

  const resendOtp = () => {
    if (!canResend) return;
    setOtp(["", "", "", ""]);
    setResendTimer(30);
    setCanResend(false);
    setTimeout(() => otpRefs[0].current?.focus(), 50);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const fmtCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtExp  = (v: string) => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d; };

  const pay = () => {
    setScreen("processing");
    setProcessingStep(0);
    [0,1,2,3].forEach((s,i) => setTimeout(() => setProcessingStep(s), i * 900));
    setTimeout(() => setScreen(Math.random() > 0.15 ? "success" : "failed"), 3800);
  };

  const reset = () => { setScreen("checkout"); setSection(null); setQrRevealed(false); };
  const toggle = (id: Section) => setSection(s => s === id ? null : id);

  const applyCoupon = () => {
    const found = AVAILABLE_COUPONS.find(c => c.code === couponInput.toUpperCase());
    if (found) {
      setAppliedCoupon(found);
      setCouponError("");
      setCouponSuccess(true);
      setCouponInput("");
      setTimeout(() => setCouponSuccess(false), 2000);
    } else {
      setCouponError("Invalid coupon code. Try SAVE50 or FIRST10.");
    }
  };

  const totalSaved = MERCHANT.discount + (appliedCoupon ? appliedCoupon.savings : 0);
  const finalAmount = MERCHANT.mrp - totalSaved;

  if (screen === "processing") return <ProcessingScreen step={processingStep} />;
  if (screen === "success")    return <SuccessScreen onHome={reset} />;
  if (screen === "failed")     return <FailedScreen  onRetry={reset} />;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 md:p-8"
      style={{ background: "linear-gradient(135deg, #E8E6F5 0%, #EEF0F8 100%)", fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-[880px] rounded-[28px] overflow-hidden shadow-[0_32px_100px_rgba(0,0,0,0.14)] flex flex-col md:flex-row">

        {/* ══ LEFT PANEL ══ */}
        <div
          className="w-full md:w-[300px] md:flex-shrink-0 flex flex-col relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #6C4DFF 0%, #5038D0 60%, #3D28A8 100%)" }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 translate-x-16 -translate-y-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white/5 -translate-x-16 translate-y-16 pointer-events-none" />

          {(() => {
            const cartItems = [
              {
                id: 1,
                name: "Detan+ Dewy Gel Sunscreen SPF 50+ PA++++ with 2% Kojic-Hyaluron Complex™ & Wild Berries - 80g",
                price: 509.15,
                mrp: 599,
                qty: 1,
                free: false,
                gradient: "from-rose-300 to-pink-400",
              },
              {
                id: 2,
                name: "FREEBIE - Glow+ Hydra Gel Moisturizer with Vitamin C & Papaya - 20 g",
                price: 0,
                mrp: 119,
                qty: 1,
                free: true,
                gradient: "from-amber-300 to-orange-400",
              },
            ];

            return (
              <div className="relative flex flex-col flex-1 p-6 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {/* Brand header */}
                <div className="flex items-center gap-1.5 mb-5">
                  <Shield className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-white/50 text-xs font-medium">Secured Checkout</span>
                </div>

                {/* Merchant row */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-bold text-base">{MERCHANT.letter}</span>
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-sm leading-tight">{MERCHANT.name}</h2>
                    <p className="text-white/50 text-[10px]">{MERCHANT.tagline}</p>
                  </div>
                </div>

                {/* Amount + toggle */}
                <button
                  onClick={() => setOrderExpanded(!orderExpanded)}
                  className="flex items-center justify-between bg-white/15 hover:bg-white/20 border border-white/20 rounded-2xl px-4 py-3 transition-all active:scale-[0.98] backdrop-blur-sm w-full mb-3"
                >
                  <div className="text-left">
                    <p className="text-white/60 text-[9px] uppercase tracking-wide font-semibold">You Pay</p>
                    <p className="text-white font-bold text-xl tracking-tight">₹{finalAmount.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-[10px]">{MERCHANT.itemCount} items</span>
                    <motion.div animate={{ rotate: orderExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-4 h-4 text-white/60" />
                    </motion.div>
                  </div>
                </button>

                {/* Expanded: product list + breakdown */}
                <AnimatePresence>
                  {orderExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      {/* Product cards */}
                      <div className="space-y-2.5 mb-3">
                        {cartItems.map((item, i) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="bg-white/10 border border-white/15 rounded-2xl p-3 flex gap-3"
                          >
                            {/* Product thumbnail */}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden`}>
                              <div className="w-8 h-10 bg-white/30 rounded-lg" />
                            </div>

                            {/* Product info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1 mb-1">
                                {item.free && (
                                  <span className="inline-block text-[9px] font-bold bg-green-400 text-green-900 px-1.5 py-0.5 rounded-full mb-1">
                                    Free Item
                                  </span>
                                )}
                              </div>
                              <p className="text-white text-[10px] font-medium leading-tight line-clamp-2 mb-1.5">
                                {item.name}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-white/50 text-[9px]">Qty: {item.qty}</span>
                                <div className="text-right">
                                  {item.free && (
                                    <span className="text-white/40 text-[9px] line-through mr-1">₹{item.mrp}</span>
                                  )}
                                  <span className={`text-[11px] font-bold ${item.free ? "text-green-300" : "text-white"}`}>
                                    {item.free ? "₹0" : `₹${item.price}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Price breakdown */}
                      <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white/60 text-xs">Subtotal</span>
                          <span className="text-white text-xs font-medium">₹{MERCHANT.mrp}</span>
                        </div>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-white/60 text-xs">Total Discount</span>
                            <ChevronDown className="w-3 h-3 text-white/40" />
                          </div>
                          <span className="text-green-300 text-xs font-medium">−₹{(MERCHANT.discount + (appliedCoupon?.savings ?? 0)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60 text-xs">Shipping</span>
                          <span className="text-green-300 text-xs font-semibold">Free</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-white/15">
                          <span className="text-white text-xs font-bold">To Pay</span>
                          <span className="text-white text-xs font-bold">₹{finalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Savings pill */}
                <div className="flex items-center justify-between bg-white/10 border border-white/15 rounded-2xl px-4 py-3 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-green-400/20 flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5 text-green-300" />
                    </div>
                    <div>
                      <p className="text-green-300 text-[9px] font-semibold uppercase tracking-wide">Total Saved</p>
                      <p className="text-white font-bold text-sm">₹{totalSaved.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-[9px]">{MERCHANT.itemCount} items</p>
                    <p className="text-white/60 text-xs line-through">₹{MERCHANT.mrp}</p>
                  </div>
                </div>

                {/* Timer + footer */}
                <div className="mt-auto pt-5 flex flex-col items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${timer < 60 ? "text-red-300" : "text-white/40"}`}>
                    <Clock className="w-3 h-3" />
                    <span>Expires in <span className="font-mono font-semibold">{fmt(timer)}</span></span>
                  </div>
                  <p className="text-white/30 text-[10px]">Secured by <span className="font-bold text-white/40">LP Fintech</span></p>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 40px)", minHeight: 520, scrollbarWidth: "none" }}>

          {/* ════ LOGIN VIEW ════ */}
          <AnimatePresence mode="wait">
          {rightView === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col h-full"
            >
              {/* Top bar: back + merchant + amount */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <button className="w-7 h-7 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95">
                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-sm">
                      <span className="text-white text-[11px] font-black">A</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-none">{MERCHANT.name}</p>
                      <p className="text-[9px] text-gray-400 leading-none mt-0.5">{MERCHANT.tagline}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-[10px]">🎁</span>
                      <span className="text-[10px] text-gray-500">Free gift added · 3 items</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">₹1,018.30</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              {/* Black "Extra Discount" banner */}
              <div className="bg-gray-900 px-5 py-2.5 text-center">
                <p className="text-white text-xs font-semibold tracking-wide">Extra Discount Available at Payment Step</p>
              </div>

              {/* Green offers section */}
              <div className="bg-[#F0FAF4] border-b border-green-100 px-5 py-4">
                {/* Savings headline */}
                <p className="text-center text-sm font-bold text-gray-800 mb-3">
                  You saved <span className="text-green-600">₹{totalSaved.toFixed(2)}</span>
                </p>

                {/* FRESH coupon row */}
                <div className="flex items-center justify-between bg-white/70 border border-green-200 rounded-xl px-3.5 py-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-800">Save ₹499 with "FRESH"</span>
                  </div>
                  <button className="text-xs font-bold text-gray-700 border border-gray-400 rounded-lg px-3 py-1 hover:bg-gray-50 transition-colors">
                    Apply
                  </button>
                </div>

                {/* Applied coupon row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-xs font-semibold text-gray-800">"AQAUTO15" applied</span>
                  </div>
                  <button className="text-xs text-green-700 font-semibold flex items-center gap-0.5 hover:underline">
                    View all coupons <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Login section */}
              <div className="flex-1 px-5 pt-4 pb-4">
                {/* Section header tab */}
                <div className="inline-flex items-center gap-1.5 border border-amber-300 bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                  <Lock className="w-3 h-3" />
                  Login to Redeem Loyalty Points
                </div>

                {/* Login to continue label */}
                <div className="flex items-center gap-2.5 mb-4">
                  <UserCircle2 className="w-8 h-8 text-gray-300 flex-shrink-0" />
                  <p className="text-sm font-semibold text-gray-700">Login to continue</p>
                </div>

                {/* Phone input — floating label style */}
                <div className="relative mb-5">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-semibold text-gray-500 z-10">
                    Enter Mobile Number
                  </label>
                  <div className={`flex border-2 rounded-xl overflow-hidden transition-all ${
                    phone.length > 0 ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
                  }`}>
                    <div className="flex items-center gap-1.5 px-3 py-3 bg-gray-50 border-r border-gray-200 flex-shrink-0">
                      <span className="text-base leading-none">🇮🇳</span>
                      <span className="text-sm font-bold text-gray-700">+91</span>
                    </div>
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="72220 17016"
                      className="flex-1 px-3 py-3 text-sm font-medium focus:outline-none bg-white text-gray-900 placeholder:text-gray-300"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Trust section */}
                <div className="flex flex-col items-center py-5 border-t border-b border-gray-100 mb-5">
                  <p className="text-[10px] text-gray-400 mb-2 font-medium">Powered by</p>
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-[#6C4DFF] flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-black text-gray-800 tracking-tight">LP Fintech</span>
                  </div>
                  <div className="flex items-center gap-5">
                    {[
                      { icon: "🛡️", label: "PCI DSS\nCertified" },
                      { icon: "🔒", label: "Secured\nPayments" },
                      { icon: "✅", label: "Verified\nMerchant" },
                    ].map(({ icon, label }) => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <span className="text-base">{icon}</span>
                        <span className="text-[9px] text-gray-500 font-medium text-center leading-tight whitespace-pre-line">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checkbox */}
                <label className="flex items-start gap-2.5 mb-4 cursor-pointer group">
                  <button
                    type="button"
                    onClick={() => setSendUpdates(!sendUpdates)}
                    className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                      sendUpdates ? "bg-gray-800 border-gray-800" : "border-gray-300 group-hover:border-gray-500"
                    }`}
                  >
                    {sendUpdates && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </button>
                  <span className="text-xs text-gray-600">
                    Send me order updates &amp; offers -{" "}
                    <span className="text-gray-400">(no spam)</span>
                  </span>
                </label>

                {/* Continue button */}
                <motion.button
                  onClick={() => phone.length === 10 && setRightView("otp")}
                  disabled={phone.length !== 10}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-sm transition-colors shadow-sm"
                >
                  Continue
                </motion.button>

                <p className="text-center text-[10px] text-gray-400 mt-3 leading-relaxed">
                  By proceeding, I agree to LP Fintech&apos;s{" "}
                  <span className="underline cursor-pointer">Privacy Policy</span>
                  {" "}and{" "}
                  <span className="underline cursor-pointer">T&amp;C</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* ════ OTP VIEW ════ */}
          {rightView === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col"
            >
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRightView("login")}
                    className="w-7 h-7 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-sm">
                      <span className="text-white text-[11px] font-black">A</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-none">{MERCHANT.name}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5 leading-none">{MERCHANT.tagline}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-[10px]">🎁</span>
                      <span className="text-[10px] text-gray-500">Free gift added · 3 items</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">₹1,018.30</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              {/* Black banner */}
              <div className="bg-gray-900 px-5 py-2.5 text-center">
                <p className="text-white text-xs font-semibold tracking-wide">Extra Discount Available at Payment Step</p>
              </div>

              {/* Green offers bar */}
              <div className="bg-[#F0FAF4] border-b border-green-100 px-5 py-4">
                <p className="text-center text-sm font-bold text-gray-800 mb-3">
                  You saved <span className="text-green-600">₹{totalSaved.toFixed(2)}</span>
                </p>
                <div className="flex items-center justify-between bg-white/70 border border-green-200 rounded-xl px-3.5 py-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-800">Save ₹499 with "FRESH"</span>
                  </div>
                  <button className="text-xs font-bold text-gray-700 border border-gray-400 rounded-lg px-3 py-1 hover:bg-gray-50 transition-colors">Apply</button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-xs font-semibold text-gray-800">"AQAUTO15" applied</span>
                  </div>
                  <button className="text-xs text-green-700 font-semibold flex items-center gap-0.5 hover:underline">
                    View all coupons <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* OTP body */}
              <div className="px-5 pt-7 pb-6 flex flex-col items-center">

                {/* Animated lock icon */}
                <div className="relative mb-5">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_8px_28px_rgba(251,146,60,0.35)]"
                    style={{ background: "linear-gradient(135deg, #FCD34D 0%, #F97316 100%)" }}
                  >
                    <Lock className="w-8 h-8 text-white" />
                  </motion.div>
                  {/* Sparkle dot */}
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-yellow-300 border-2 border-white flex items-center justify-center shadow-sm"
                  >
                    <span className="text-[9px]">✦</span>
                  </motion.div>
                </div>

                <h2 className="text-base font-bold text-gray-900 mb-0.5">Verify Mobile Securely</h2>
                <p className="text-xs text-gray-500 mb-1">Verify mobile number</p>
                <p className="text-xs text-gray-500 mb-7 text-center leading-relaxed">
                  Enter OTP sent to{" "}
                  <span className="font-semibold text-gray-800">
                    +91 {phone.slice(0, 5)} {phone.slice(5)}
                  </span>{" "}
                  <button
                    onClick={() => setRightView("login")}
                    className="text-[#6C4DFF] font-semibold hover:underline"
                  >
                    Edit
                  </button>
                </p>

                {/* 4 OTP boxes */}
                <div className="flex gap-3 mb-7">
                  {otp.map((digit, i) => (
                    <motion.input
                      key={i}
                      ref={otpRefs[i]}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      maxLength={1}
                      inputMode="numeric"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.06, type: "spring", damping: 14 }}
                      className={`w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 focus:outline-none transition-all duration-150 ${
                        digit
                          ? "border-[#6C4DFF] bg-purple-50 text-[#6C4DFF] shadow-[0_0_0_3px_rgba(108,77,255,0.12)]"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:border-[#6C4DFF] focus:bg-white focus:shadow-[0_0_0_3px_rgba(108,77,255,0.1)]"
                      }`}
                    />
                  ))}
                </div>

                {/* Resend */}
                <div className="flex items-center gap-2 mb-4">
                  <motion.button
                    onClick={resendOtp}
                    disabled={!canResend}
                    whileTap={canResend ? { scale: 0.96 } : {}}
                    className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                      canResend ? "text-[#6C4DFF] hover:underline cursor-pointer" : "text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <svg className={`w-3.5 h-3.5 ${canResend ? "text-[#6C4DFF]" : "text-gray-300"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                    </svg>
                    {canResend ? "Resend OTP" : `Resend OTP in ${resendTimer}s`}
                  </motion.button>
                </div>

                {/* Skip OTP */}
                <button
                  onClick={() => setRightView("checkout")}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors mb-6"
                >
                  <span className="underline underline-offset-2">Skip OTP</span>
                  <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[9px] text-gray-400 font-bold flex-shrink-0">i</span>
                </button>

                {/* Trust footer */}
                <div className="w-full border-t border-gray-100 pt-5 flex flex-col items-center gap-1.5">
                  <p className="text-[10px] text-gray-400 font-medium">Powered by</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-[#6C4DFF] flex items-center justify-center">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-black text-gray-800 tracking-tight">LP Fintech</span>
                  </div>
                  <div className="flex items-center gap-5 mt-2">
                    {[
                      { icon: "🛡️", label: "PCI DSS\nCertified" },
                      { icon: "🔒", label: "Secured\nPayments" },
                      { icon: "✅", label: "Verified\nMerchant" },
                    ].map(({ icon, label }) => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <span className="text-sm">{icon}</span>
                        <span className="text-[9px] text-gray-400 text-center leading-tight whitespace-pre-line">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ════ CHECKOUT VIEW ════ */}
          {rightView === "checkout" && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
            {/* verified phone bar */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100 bg-green-50/60">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  +91 {phone.slice(0, 5)} {phone.slice(5)}
                </span>
                <span className="text-[10px] text-green-600 font-semibold">· Verified</span>
              </div>
              <button
                onClick={() => setRightView("otp")}
                className="text-[10px] font-semibold text-[#6C4DFF] hover:underline"
              >
                Change
              </button>
            </div>

              {/* ── DELIVERY DETAILS ── */}
            <section className="px-5 pt-5 pb-4 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Delivery Details</p>
              {(() => {
                const addr = SAVED_ADDRESSES[selectedAddrIdx];
                return (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">Deliver To {addr.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed truncate">{addr.line1},</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{addr.line2}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {addr.phone}
                            <span className="mx-1.5 text-gray-300">|</span>
                            {addr.email}
                          </p>
                        </div>
                        <button
                          onClick={() => { setShowAddressSheet(true); setShowAddNewForm(false); }}
                          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors active:scale-95"
                        >
                          <Edit3 className="w-3 h-3" />
                          Change
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Truck className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs text-gray-600 font-medium">Free Shipping</span>
                        <span className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">Free</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </section>

            {/* ── OFFERS & REWARDS ── */}
            <section className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Offers &amp; Rewards</p>
                {appliedCoupon && (
                  <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                    <Tag className="w-3 h-3" />
                    You saved ₹{totalSaved.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Coupon input */}
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                    onKeyDown={e => e.key === "Enter" && applyCoupon()}
                    placeholder="Enter coupon code"
                    className="w-full text-sm pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C4DFF] focus:ring-1 focus:ring-purple-200 transition-all"
                  />
                </div>
                <button
                  onClick={applyCoupon}
                  disabled={!couponInput.trim()}
                  className="px-4 py-2.5 bg-[#6C4DFF] hover:bg-[#5B3EEE] disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition-colors active:scale-95"
                >
                  Apply
                </button>
              </div>

              {/* Error */}
              <AnimatePresence>
                {couponError && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-500 mb-2 flex items-center gap-1.5">
                    <X className="w-3 h-3" /> {couponError}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Applied coupon */}
              {appliedCoupon && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-3.5 py-2.5 mb-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-green-800">"{appliedCoupon.code}" applied</p>
                    <p className="text-[10px] text-green-600">{appliedCoupon.desc} · Saved ₹{appliedCoupon.savings}</p>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(AVAILABLE_COUPONS[0])}
                    className="text-green-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              {/* View all coupons */}
              <button
                onClick={() => setShowAllCoupons(!showAllCoupons)}
                className="flex items-center gap-1.5 text-[#6C4DFF] text-xs font-semibold hover:underline"
              >
                View all coupons
                <motion.span animate={{ rotate: showAllCoupons ? 180 : 0 }} transition={{ duration: 0.2 }} className="inline-block">
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </button>

              <AnimatePresence>
                {showAllCoupons && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="mt-3 space-y-2">
                      {AVAILABLE_COUPONS.map(c => (
                        <button
                          key={c.code}
                          onClick={() => { setAppliedCoupon(c); setShowAllCoupons(false); }}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all active:scale-[0.98] ${appliedCoupon?.code === c.code ? "border-green-300 bg-green-50" : "border-dashed border-gray-200 hover:border-[#6C4DFF] hover:bg-purple-50"}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${appliedCoupon?.code === c.code ? "bg-green-500" : "bg-purple-100"}`}>
                              {appliedCoupon?.code === c.code ? <Check className="w-3.5 h-3.5 text-white" /> : <Tag className="w-3.5 h-3.5 text-[#6C4DFF]" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">{c.code}</p>
                              <p className="text-[10px] text-gray-500">{c.desc}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-green-600 flex-shrink-0">Save ₹{c.savings}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* ── PAYMENT OPTIONS ── */}
            <section>
              <div className="px-5 pt-4 pb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Options</p>
                {/* Online discount notice */}
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 mb-3">
                  <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-800 font-medium">Extra 5% discount upto ₹50 on online payments</p>
                </div>
              </div>

              {/* Quick Bank Pills */}
              <div className="px-5 pb-3 border-b border-gray-100">
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {QUICK_BANKS.map(bank => (
                    <button key={bank.id} onClick={pay}
                      className="flex items-center gap-2 flex-shrink-0 pl-2.5 pr-3.5 py-2 rounded-2xl border border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm transition-all active:scale-95 group">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ background: bank.color }}>{bank.abbr}</div>
                      <div>
                        <p className="text-[11px] font-semibold text-gray-800 group-hover:text-[#6C4DFF] whitespace-nowrap transition-colors">{bank.name}</p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider">Net Banking</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI / QR Section */}
              <div className="border-b border-gray-100">
                {/* UPI header row with pricing */}
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-[#6C4DFF]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">UPI</span>
                        <span className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">Save ₹{MERCHANT.couponDiscount}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-400 line-through">₹{MERCHANT.displayAmount}</span>
                        <span className="text-sm font-bold text-gray-900">₹{MERCHANT.amount}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle("upi")}
                    className="flex items-center gap-1 text-xs font-semibold text-[#6C4DFF] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Enter UPI ID <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* UPI ID form */}
                <AnimatePresence>
                  {section === "upi" && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="px-5 pb-4">
                        <div className="flex gap-2 mb-2">
                          <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="Enter UPI ID (e.g. name@okicici)"
                            className="flex-1 text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C4DFF] focus:ring-1 focus:ring-purple-200 transition-all" />
                          <button onClick={pay} className="px-4 py-2.5 bg-[#6C4DFF] text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform">Pay</button>
                        </div>
                        <p className="text-[10px] text-gray-400">Works with GPay, PhonePe, Paytm &amp; all UPI apps</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* QR Code */}
                <div className="px-5 pb-4">
                  <div className="flex items-start gap-5 bg-gray-50 rounded-2xl p-4">
                    {/* QR */}
                    <div className="relative flex-shrink-0">
                      <div className={`transition-all duration-500 ${qrRevealed ? "filter-none" : "blur-sm"}`}>
                        <QRGrid size={19} />
                      </div>
                      {!qrRevealed && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button onClick={() => setQrRevealed(true)}
                            className="bg-[#6C4DFF] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg active:scale-95 transition-all whitespace-nowrap">
                            Click to see QR
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium mb-2">Scan the QR using any UPI App</p>
                      <div className="flex items-center gap-1.5 mb-3">
                        {UPI_APP_LOGOS.map(app => (
                          <div key={app.name} className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow-sm" style={{ background: app.color }}>{app.abbr}</div>
                        ))}
                        <span className="text-[10px] text-gray-400">+ more</span>
                      </div>
                      {qrRevealed && (
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-2.5 py-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] text-gray-400">UPI ID</p>
                            <p className="text-[11px] font-mono font-bold text-gray-900 truncate">aqualogica@paytm</p>
                          </div>
                          <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                            className="flex items-center gap-1 text-[#6C4DFF] text-[10px] font-bold px-2 py-1 bg-purple-50 rounded-lg">
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? "Copied" : "Copy"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Other options */}
              <div className="px-5 pt-3 pb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">More Payment Methods</p>
              </div>

              <div>
                {/* Net Banking */}
                <OptionRow icon={Building2} label="Net Banking" isOpen={section === "netbanking"} onToggle={() => toggle("netbanking")}>
                  <input value={bankSearch} onChange={e => setBankSearch(e.target.value)} placeholder="Search your bank..."
                    className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C4DFF] focus:ring-1 focus:ring-purple-200 transition-all mb-3" />
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_BANKS.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase())).map(bank => (
                      <button key={bank.id} onClick={pay}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:border-[#6C4DFF] hover:bg-purple-50 transition-all active:scale-95">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ background: bank.color }}>{bank.abbr}</div>
                        <span className="text-xs font-medium text-gray-900 truncate">{bank.name}</span>
                      </button>
                    ))}
                  </div>
                </OptionRow>

                {/* Wallets */}
                <OptionRow icon={Wallet} label="Wallets" badge="Balance available" isOpen={section === "wallets"} onToggle={() => toggle("wallets")}>
                  <div className="space-y-2">
                    {WALLETS.map(w => (
                      <button key={w.id} onClick={pay}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50 hover:border-[#6C4DFF] hover:bg-purple-50 transition-all active:scale-[0.98]">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ background: w.color }}>{w.name[0]}</div>
                          <span className="text-sm font-medium text-gray-900">{w.name}</span>
                        </div>
                        <span className={`text-xs font-semibold ${w.balance === "₹0" ? "text-gray-400" : "text-green-600"}`}>{w.balance}</span>
                      </button>
                    ))}
                  </div>
                </OptionRow>

                {/* Card */}
                <OptionRow icon={CreditCard} label="Card" badge="1 Saved" savingsBadge="5% off" isOpen={section === "card"} onToggle={() => toggle("card")}>
                  {/* Saved card */}
                  <div className="mb-3 p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-6 bg-gradient-to-r from-[#6C4DFF] to-[#8B6FFF] rounded-md flex items-center justify-center">
                        <CreditCard className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">HDFC Regalia •••• 4231</p>
                        <p className="text-[10px] text-gray-500">Visa · Expires 09/27</p>
                      </div>
                    </div>
                    <button onClick={pay} className="text-xs bg-[#6C4DFF] text-white px-3 py-1.5 rounded-lg font-semibold active:scale-95 transition-transform">Pay</button>
                  </div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Add New Card</p>
                  <div className="space-y-2">
                    <input value={cardNum} onChange={e => setCardNum(fmtCard(e.target.value))} placeholder="Card number" className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C4DFF] transition-all" />
                    <div className="flex gap-2">
                      <input value={cardExpiry} onChange={e => setCardExpiry(fmtExp(e.target.value))} placeholder="MM/YY" className="flex-1 text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C4DFF] transition-all" />
                      <div className="relative flex-1">
                        <input value={cardCVV} onChange={e => setCardCVV(e.target.value.replace(/\D/g,"").slice(0,4))} type={showCVV?"text":"password"} placeholder="CVV" className="w-full text-sm px-3.5 py-2.5 pr-9 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C4DFF] transition-all" />
                        <button onClick={() => setShowCVV(!showCVV)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">{showCVV ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                      </div>
                    </div>
                    <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Name on card" className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C4DFF] transition-all" />
                    <div className="flex items-center gap-2 py-0.5">
                      <button onClick={() => setSaveCard(!saveCard)} className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0" style={{ background: saveCard ? "#6C4DFF" : "#D1D5DB" }}>
                        <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" style={{ transform: saveCard ? "translateX(17px)" : "translateX(2px)" }} />
                      </button>
                      <span className="text-xs text-gray-700 font-medium">Save card for faster checkout</span>
                    </div>
                    <button onClick={pay} className="w-full py-3 text-white font-semibold rounded-xl shadow-lg active:scale-[0.98] transition-transform text-sm" style={{ background: "linear-gradient(135deg, #6C4DFF, #8B6FFF)" }}>
                      Pay ₹{finalAmount.toFixed(2)}
                    </button>
                  </div>
                </OptionRow>

                {/* Paylater */}
                <OptionRow icon={Calendar} label="Paylater" sublabel="Pay after delivery — 0% interest" isOpen={section === "paylater"} onToggle={() => toggle("paylater")}>
                  <div className="space-y-2">
                    {PAY_LATER.map(p => (
                      <button key={p.id} onClick={pay}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50 hover:border-[#6C4DFF] hover:bg-purple-50 transition-all active:scale-[0.98]">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ background: p.color }}>{p.name[0]}</div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{p.name}</p>
                            <p className="text-[10px] text-gray-500">Limit: {p.limit}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </OptionRow>

                {/* Cardless EMI */}
                <OptionRow icon={Star} label="Cardless EMI" sublabel="No cost EMI on select tenures" isOpen={section === "emi"} onToggle={() => toggle("emi")}>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {EMI_TENURES.map(t => {
                      const mo = Math.ceil(finalAmount / t);
                      const sel = selectedTenure === t;
                      return (
                        <button key={t} onClick={() => setSelectedTenure(t)}
                          className={`p-2.5 rounded-xl border text-center transition-all active:scale-95 ${sel ? "border-[#6C4DFF] bg-purple-50 shadow-[0_0_0_2px_rgba(108,77,255,0.15)]" : "border-gray-200 bg-gray-50"}`}>
                          <p className={`text-xs font-bold ${sel ? "text-[#6C4DFF]" : "text-gray-900"}`}>₹{mo}</p>
                          <p className="text-[9px] text-gray-500">/mo × {t}</p>
                          {t <= 6 && <p className="text-[8px] text-green-600 font-semibold">No cost</p>}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={pay} className="w-full py-3 text-white font-semibold rounded-xl shadow-lg active:scale-[0.98] transition-transform text-sm" style={{ background: "linear-gradient(135deg, #6C4DFF, #8B6FFF)" }}>
                    Pay ₹{Math.ceil(finalAmount / selectedTenure)}/mo × {selectedTenure} months
                  </button>
                </OptionRow>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-gray-500 font-medium">100% Secure · SSL Encrypted</span>
                </div>
                <span className="text-[10px] text-gray-400">Powered by <span className="font-semibold text-[#6C4DFF]">LP Fintech</span></span>
              </div>
            </section>
            </motion.div>
          )}
          </AnimatePresence>

          </div>

          {/* ══ ADDRESS BOTTOM SHEET ══ */}
          <AnimatePresence>
            {showAddressSheet && (
              <>
                {/* Dim backdrop */}
                <motion.div
                  key="addr-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black/25 z-20"
                  onClick={() => setShowAddressSheet(false)}
                />

                {/* Sheet */}
                <motion.div
                  key="addr-sheet"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 320 }}
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-30 shadow-[0_-8px_40px_rgba(0,0,0,0.15)] overflow-hidden"
                  style={{ maxHeight: "82%" }}
                >
                  {/* Drag handle */}
                  <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                  </div>

                  {/* Sheet header */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                    <p className="font-bold text-gray-900 text-sm">Select Delivery Address</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setShowAddNewForm(true); }}
                        className="flex items-center gap-1 text-[#6C4DFF] text-xs font-bold hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add New Address
                      </button>
                      <button
                        onClick={() => setShowAddressSheet(false)}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-y-auto" style={{ maxHeight: "calc(82vh - 80px)", scrollbarWidth: "none" }}>
                    <AnimatePresence mode="wait">
                      {!showAddNewForm ? (
                        /* ── Saved address cards ── */
                        <motion.div
                          key="addr-list"
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -16 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 py-4 space-y-3"
                        >
                          {SAVED_ADDRESSES.map((addr, i) => {
                            const isSelected = selectedAddrIdx === i;
                            return (
                              <motion.div
                                key={addr.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                                className={`border-2 rounded-2xl p-4 transition-all ${
                                  isSelected
                                    ? "border-[#6C4DFF] bg-purple-50/40"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                              >
                                {/* Card header */}
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-gray-900">{addr.name}</p>
                                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                                      {addr.type}
                                    </span>
                                  </div>
                                  <button className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                                    <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                                  </button>
                                </div>

                                {/* Address text */}
                                <p className="text-xs text-gray-600 leading-relaxed mb-0.5">{addr.line1}</p>
                                <p className="text-xs text-gray-600 leading-relaxed mb-1">{addr.line2}</p>
                                <p className="text-xs text-gray-400 mb-3">{addr.email}</p>

                                {/* CTA */}
                                <button
                                  onClick={() => {
                                    setSelectedAddrIdx(i);
                                    setTimeout(() => setShowAddressSheet(false), 300);
                                  }}
                                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
                                    isSelected
                                      ? "bg-[#6C4DFF] text-white shadow-[0_4px_14px_rgba(108,77,255,0.35)]"
                                      : "bg-white border-2 border-gray-200 text-gray-600 hover:border-[#6C4DFF] hover:text-[#6C4DFF]"
                                  }`}
                                >
                                  {isSelected ? "Deliver Here" : "Select Address"}
                                </button>
                              </motion.div>
                            );
                          })}

                          {/* See All */}
                          <button className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-500 font-semibold text-sm rounded-2xl hover:border-[#6C4DFF] hover:text-[#6C4DFF] transition-colors">
                            See All Addresses
                          </button>
                        </motion.div>
                      ) : (
                        /* ── Add New Address form ── */
                        <motion.div
                          key="addr-form"
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 16 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 py-4"
                        >
                          <button
                            onClick={() => setShowAddNewForm(false)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 mb-4 transition-colors"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to saved addresses
                          </button>

                          <div className="space-y-3">
                            {/* Name + Phone */}
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Full Name</label>
                                <input
                                  value={newAddr.name}
                                  onChange={e => setNewAddr(a => ({ ...a, name: e.target.value }))}
                                  placeholder="Aditi Agarwal"
                                  className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C4DFF] focus:ring-1 focus:ring-purple-100 transition-all"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Mobile Number</label>
                                <input
                                  value={newAddr.phone}
                                  onChange={e => setNewAddr(a => ({ ...a, phone: e.target.value.replace(/\D/g,"").slice(0,10) }))}
                                  placeholder="98XXXXXXXX"
                                  className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C4DFF] focus:ring-1 focus:ring-purple-100 transition-all"
                                />
                              </div>
                            </div>

                            {/* Pincode */}
                            <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Pincode</label>
                              <input
                                value={newAddr.pincode}
                                onChange={e => setNewAddr(a => ({ ...a, pincode: e.target.value.replace(/\D/g,"").slice(0,6) }))}
                                placeholder="302015"
                                className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C4DFF] focus:ring-1 focus:ring-purple-100 transition-all"
                              />
                            </div>

                            {/* Address lines */}
                            <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Address Line 1</label>
                              <input
                                value={newAddr.line1}
                                onChange={e => setNewAddr(a => ({ ...a, line1: e.target.value }))}
                                placeholder="House / Flat No., Building Name"
                                className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C4DFF] focus:ring-1 focus:ring-purple-100 transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Address Line 2 <span className="text-gray-300 normal-case font-normal">(Landmark / Area)</span></label>
                              <input
                                value={newAddr.line2}
                                onChange={e => setNewAddr(a => ({ ...a, line2: e.target.value }))}
                                placeholder="Near Arihant Diagnostic Center"
                                className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C4DFF] focus:ring-1 focus:ring-purple-100 transition-all"
                              />
                            </div>

                            {/* City + State */}
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">City</label>
                                <input
                                  value={newAddr.city}
                                  onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))}
                                  placeholder="Jaipur"
                                  className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C4DFF] focus:ring-1 focus:ring-purple-100 transition-all"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">State</label>
                                <input
                                  value={newAddr.state}
                                  onChange={e => setNewAddr(a => ({ ...a, state: e.target.value }))}
                                  placeholder="Rajasthan"
                                  className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C4DFF] focus:ring-1 focus:ring-purple-100 transition-all"
                                />
                              </div>
                            </div>

                            {/* Address type */}
                            <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Address Type</label>
                              <div className="flex gap-2">
                                {["Home", "Work", "Other"].map(t => (
                                  <button
                                    key={t}
                                    onClick={() => setNewAddr(a => ({ ...a, type: t }))}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 ${
                                      newAddr.type === t
                                        ? "border-[#6C4DFF] bg-purple-50 text-[#6C4DFF]"
                                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                                    }`}
                                  >
                                    {t === "Home" ? "🏠" : t === "Work" ? "🏢" : "📍"} {t}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Save button */}
                            <button
                              onClick={() => {
                                if (newAddr.name && newAddr.line1) {
                                  SAVED_ADDRESSES.push({
                                    id: SAVED_ADDRESSES.length,
                                    name: newAddr.name,
                                    type: newAddr.type,
                                    line1: newAddr.line1,
                                    line2: `${newAddr.line2}${newAddr.city ? ", " + newAddr.city : ""}${newAddr.state ? ", " + newAddr.state : ""}${newAddr.pincode ? " " + newAddr.pincode : ""}`,
                                    phone: "+91 " + newAddr.phone,
                                    email: SAVED_ADDRESSES[0].email,
                                  });
                                  setSelectedAddrIdx(SAVED_ADDRESSES.length - 1);
                                  setNewAddr({ name:"", phone:"", pincode:"", line1:"", line2:"", city:"", state:"", type:"Home" });
                                  setShowAddNewForm(false);
                                  setTimeout(() => setShowAddressSheet(false), 400);
                                }
                              }}
                              className="w-full py-3.5 bg-[#6C4DFF] hover:bg-[#5B3EEE] text-white font-bold rounded-2xl text-sm shadow-[0_4px_14px_rgba(108,77,255,0.35)] active:scale-[0.98] transition-all"
                            >
                              Save &amp; Deliver Here
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
