'use client';

import { Upload, FileSearch, CheckCircle2, Send, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    number: '01',
    title: 'Sign In',
    desc: 'Enter your phone number, verify with OTP, and select your state.',
    icon: Upload,
    color: '#C85A40',
    bg: '#FFF5F0',
    border: '#FFD4C4',
  },
  {
    number: '02',
    title: 'Create Application',
    desc: 'Select a service, enter citizen details, add family members.',
    icon: FileSearch,
    color: '#4A7A59',
    bg: '#F0F7F3',
    border: '#C8E6D4',
  },
  {
    number: '03',
    title: 'Upload & Run Checks',
    desc: 'Attach mock documents, run preflight. AI catches errors instantly.',
    icon: CheckCircle2,
    color: '#5B6FA6',
    bg: '#F0F2FA',
    border: '#C4CBE6',
  },
  {
    number: '04',
    title: 'Resolve & Submit',
    desc: 'Fix any blockers, then submit with confidence. Department verifies final.',
    icon: Send,
    color: '#C85A40',
    bg: '#FFF5F0',
    border: '#FFD4C4',
  },
];

export default function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 border-t border-[#EAE5DC]"
    >
      <div className="rounded-[28px] border border-[#EEDFD5] bg-gradient-to-b from-[#FCFBFA] to-[#F8F4F0] px-6 py-8 shadow-[0_12px_40px_rgba(200,90,64,0.06)] text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FCF8F4] border border-[#EAE5DC] text-[12px] font-semibold text-[#C85A40] tracking-[0.15em] uppercase mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C85A40] animate-pulse" />
          4-Step Process
        </div>

        <div>
          <h2
            className="font-bold tracking-tight leading-tight text-[#050505] mb-4"
            style={{ fontSize: 'clamp(22px, 4vw, 42px)' }}
          >
            From Login to Submission
            <br />
            <span className="text-[#C85A40]">in Minutes</span>
          </h2>

          <p className="text-sm sm:text-base text-[#62605D] max-w-lg mx-auto mb-14 leading-relaxed">
            No technical skills needed. Sign in, upload documents, let the engine check them, fix what it finds, and
            submit a clean packet.
          </p>
        </div>

        <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative flex flex-col items-center text-center group">
                <div className="relative mb-7 flex items-center justify-center">
                  <span
                    className="absolute font-black leading-none select-none"
                    style={{
                      fontSize: 'clamp(64px, 8vw, 96px)',
                      color: step.color,
                      opacity: 0.1,
                    }}
                  >
                    {step.number}
                  </span>

                  <div
                    className="relative z-10 flex items-center justify-center rounded-full border-[2.5px] shadow-lg transition-transform duration-300 group-hover:-translate-y-1"
                    style={{
                      width: 80,
                      height: 80,
                      backgroundColor: step.bg,
                      borderColor: step.border,
                      boxShadow: `0 12px 24px ${step.color}18`,
                    }}
                  >
                    <Icon size={32} style={{ color: step.color }} strokeWidth={1.5} />
                    <span
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-white text-[11px] font-black flex items-center justify-center shadow-md"
                      style={{ backgroundColor: step.color }}
                    >
                      {index + 1}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#050505] mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[#5A5652] max-w-[220px] mx-auto">{step.desc}</p>

                {index < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-3 z-20">
                    <ArrowRight size={16} className="text-[#C85A40]/30" />
                  </div>
                )}

                {index < STEPS.length - 1 && (
                  <div className="sm:hidden mt-6 w-0.5 h-8 bg-gradient-to-b from-[#C85A40]/30 to-transparent mx-auto" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-14">
          <p className="text-xs text-[#62605D] mt-3">Phone verification powered by Phone.email</p>
        </div>
      </div>
    </section>
  );
}
