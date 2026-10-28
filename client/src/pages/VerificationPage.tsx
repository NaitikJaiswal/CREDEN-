import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApiClient } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  Award,
  Calendar,
  Building,
  User,
  Clock,
  Lock,
  Sparkles,
} from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [searchParams] = useSearchParams();

  // Verification Input
  const [tokenInput, setTokenInput] = useState<string>(searchParams.get('token') || '');
  const [refInput, setRefInput] = useState<string>(searchParams.get('ref') || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Request Generation (Student / Verifier role)
  const [studentIdInput, setStudentIdInput] = useState<string>('ENR-0001');
  const [generatedRequest, setGeneratedRequest] = useState<any | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);

  const handleVerify = async (token?: string, ref?: string) => {
    const t = token || tokenInput;
    const r = ref || refInput;

    if (!t && !r) {
      setErrorMsg('Please enter either a verification token or reference ID.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setVerificationResult(null);

    try {
      const res = await ApiClient.verifyCredential({ token: t || undefined, ref: r || undefined });
      if (res.success) {
        setVerificationResult(res);
        if (res.verificationStatus === 'VERIFIED') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFFFFF', '#A1A1AA', '#36D399'],
          });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Academic claim could not be verified.');
    } finally {
      setIsLoading(false);
    }
  };

  // If URL has token on mount, automatically verify
  useEffect(() => {
    const queryToken = searchParams.get('token');
    const queryRef = searchParams.get('ref');
    if (queryToken || queryRef) {
      handleVerify(queryToken || undefined, queryRef || undefined);
    }
  }, []);

  const handleGenerateShareableToken = async () => {
    setGenerating(true);
    try {
      const res = await ApiClient.createVerificationRequest({
        studentId: studentIdInput,
        requesterOrg: user?.name ? `${user.name} Organization` : 'Authorized Verifier Corp',
        requesterEmail: user?.email || 'verifier@partner.org',
      });
      if (res.success) {
        setGeneratedRequest(res);
        setTokenInput(res.rawToken);
        setRefInput(res.verificationReference);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to issue token');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181818] border border-[#333333] text-neutral-300 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
          <span>Authorized Academic Verification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Secure Academic Claim Verification
        </h1>
        <p className="text-xs text-neutral-400 mt-2">
          Verify authentic academic enrolments and institutional accreditation via high-entropy cryptographic tokens without leaking private student identifiers.
        </p>
      </div>

      {/* Verification Query Card */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Query Academic Claim
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Cryptographic Token (From QR Code or Share Link)
            </label>
            <input
              type="text"
              placeholder="e.g. 7f8a9b2c3d4e5f6..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2.5 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Or Verification Reference Code
            </label>
            <input
              type="text"
              placeholder="e.g. CRDN-VRF-2026-98124"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2.5 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 min-w-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-neutral-500">Zero unmasked personal data exposed to verifier.</span>
          <button
            onClick={() => handleVerify()}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs shadow-md shadow-white/10 hover:bg-neutral-200 hover:scale-[1.01] transition-all disabled:opacity-40 flex items-center gap-2"
          >
            <span>{isLoading ? 'Verifying Gateway...' : 'Execute Claim Verification'}</span>
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* VERIFICATION RESULT DOSSIER */}
      {verificationResult && (
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#141414] to-[#0A0A0A] border border-[#333333] shadow-2xl relative overflow-hidden space-y-6 animate-fade-in">
          {/* Top Trust Watermark */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#222222]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{verificationResult.verificationStatus.replace(/_/g, ' ')}</span>
                </span>
                <span className="text-xs font-mono text-neutral-300">{verificationResult.verificationReference}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-2">
                Authentic Academic Record Verified
              </h2>
            </div>

            <div className="text-right text-xs text-neutral-400">
              <p>Verified At: <strong className="text-white">{new Date(verificationResult.verifiedAt).toLocaleString('en-IN')}</strong></p>
              <p>Expires: <strong className="text-neutral-300">{new Date(verificationResult.expiresAt).toLocaleDateString('en-IN')}</strong></p>
            </div>
          </div>

          {/* Minimal Necessary Claims Returned */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Student Minimal Identity */}
            <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#222222] space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-300" />
                <span>Verified Candidate Identity (Minimization)</span>
              </h4>
              <p className="text-neutral-300">Masked Name: <strong className="text-white">{verificationResult.academicRecord.maskedStudentName}</strong></p>
              <p className="text-neutral-300">Protected APAAR ID: <strong className="text-white font-mono">{verificationResult.academicRecord.studentMaskedId}</strong></p>
              <p className="text-neutral-300">Student Roll / ID: <strong className="text-neutral-200 font-mono">{verificationResult.academicRecord.institutionStudentId}</strong></p>
            </div>

            {/* Issuing Institution */}
            <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#222222] space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-neutral-300" />
                <span>Issuing AICTE Approved Institution</span>
              </h4>
              <p className="text-white font-bold">{verificationResult.issuingInstitution.name}</p>
              <p className="text-neutral-300">AICTE Approval Code: <strong className="text-neutral-200">{verificationResult.issuingInstitution.code}</strong></p>
              <p className="text-neutral-300">State: <strong className="text-neutral-200">{verificationResult.issuingInstitution.state}</strong></p>
            </div>
          </div>

          {/* Academic Programme Claim */}
          <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Programme Award</span>
              <h3 className="text-base font-bold text-white mt-0.5">{verificationResult.academicRecord.programmeName}</h3>
              <p className="text-neutral-400 mt-0.5">
                Academic Cycle: {verificationResult.academicRecord.academicYear} • Status: <strong className="text-emerald-400">{verificationResult.academicRecord.enrolmentStatus.replace(/_/g, ' ')}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#181818] text-neutral-300 border border-[#333333]">
                AICTE Approved Curricula
              </span>
            </div>
          </div>

          {/* Cryptographic Proof & Disclaimer */}
          <div className="p-4 rounded-2xl bg-[#000000] border border-[#222222] text-[11px] space-y-1.5 text-neutral-400">
            <p className="flex items-center gap-1.5 text-neutral-300 font-semibold">
              <Lock className="w-3.5 h-3.5 text-white" />
              <span>Digital Proof: {verificationResult.integrityProof.digitalSignatureAlgorithm}</span>
            </p>
            <p className="italic text-neutral-500">
              {verificationResult.disclaimer}
            </p>
          </div>
        </div>
      )}

      {/* GENERATE TOKEN & QR CODE DEMO GENERATOR */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <h3 className="text-sm font-bold text-white">
            Issue New Verification Token & Scannable QR Code (Demo Tool)
          </h3>
        </div>
        <p className="text-xs text-neutral-400">
          Demonstrate how institutions or students generate time-limited, claim-specific verification links and QR codes.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={studentIdInput}
            onChange={(e) => setStudentIdInput(e.target.value)}
            placeholder="Student Enrolment ID (e.g. ENR-0001)"
            className="flex-1 bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          />
          <button
            onClick={handleGenerateShareableToken}
            disabled={generating}
            className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors shadow-md shadow-white/10"
          >
            {generating ? 'Generating...' : 'Generate QR & Token'}
          </button>
        </div>

        {generatedRequest && (
          <div className="mt-4 p-4 rounded-xl bg-[#0A0A0A] border border-[#333333] flex flex-col sm:flex-row items-center gap-6 animate-fade-in text-xs">
            <img
              src={generatedRequest.qrCodeDataUrl}
              alt="Verification QR Code"
              className="w-32 h-32 rounded-xl border border-[#333333] p-1 bg-[#000000]"
            />
            <div className="space-y-1.5 text-neutral-300">
              <p className="font-bold text-white text-sm">Verification Link Generated</p>
              <p><span className="text-neutral-500">Reference:</span> <span className="font-mono text-white font-bold">{generatedRequest.verificationReference}</span></p>
              <p><span className="text-neutral-500">Token:</span> <span className="font-mono text-neutral-400 break-all">{generatedRequest.rawToken}</span></p>
              <p className="text-[11px] text-neutral-500">Scan QR with mobile device or click verify above to test workflow.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

