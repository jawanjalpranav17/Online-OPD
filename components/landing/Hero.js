import { useState } from 'react';
import Link from 'next/link';

export default function Hero() {
  const [demoEmail, setDemoEmail] = useState('');
  const [demoSent, setDemoSent] = useState(false);

  const handleBookDemo = (e) => {
    e.preventDefault();
    if (!demoEmail) return;
    const subject = encodeURIComponent('ClinX Demo Request');
    const body = encodeURIComponent(`Hi ClinX team, I'd like to book a demo. Email: ${demoEmail}`);
    window.location.href = `mailto:support@clinx.com?subject=${subject}&body=${body}`;
    setDemoSent(true);
    setDemoEmail('');
    setTimeout(() => setDemoSent(false), 6000);
  };
  return (
    <section id="hero" className="relative bg-white py-12 lg:py-20 overflow-hidden">
      <div className="absolute top-0 right-0 h-full w-[45%] lg:w-[42%] bg-[#E0F7F3] rounded-l-[150px] z-0 hidden lg:block"></div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="lg:w-[48%]">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-[850] text-[#0B1120] leading-tight mb-4 tracking-tight">
                Run Your Practice
                <br />
                <span className="text-[#00C9A7]">Smarter</span>
              </h1>
              <p className="text-base text-gray-500 mb-8 mt-4 leading-relaxed font-medium">
                Manage OPD, Pharmacy, Labs, IPD, EMR, Website &mdash; all in
                one place.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4 mb-6">
                <Link
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#00C9A7] hover:bg-[#00B596] text-white text-sm font-bold rounded-lg transition-all shadow-md hover:shadow-lg whitespace-nowrap min-w-[160px]"
                  href="/patient/signup"
                >
                  Book Appointment &rarr;
                </Link>
                <Link
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#00C9A7] text-[#00C9A7] hover:bg-teal-50 text-sm font-bold rounded-lg transition-all whitespace-nowrap"
                  href="/auth/signup"
                >
                  Start Free OPD, EMR
                </Link>
                <div className="w-full max-w-[480px]">
                  <div className="w-full max-w-2xl mx-auto">
                    <form onSubmit={handleBookDemo} className="flex flex-col gap-4 sm:flex-row sm:gap-2 w-full">
                      <input
                        type="text"
                        placeholder="Enter your email"
                        name="register"
                        className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        required
                      />
                      <button
                        type="submit"
                        className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Book demo
                      </button>
                    </form>
                    {demoSent && (
                      <p className="text-xs text-emerald-600 font-medium mt-2">Thanks! Your email client has been opened to send the demo request.</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  RECOGNIZED BY GLOBAL TECH LEADERS
                </p>
                <div className="flex flex-wrap items-center gap-5 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-auto text-[#00A4EF]">
                      <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623"></path>
                    </svg>
                    <span className="text-gray-500 text-xs font-bold leading-tight">
                      Microsoft
                      <br />
                      for Startups
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-auto text-[#4285F4]">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path>
                    </svg>
                    <span className="text-gray-500 text-xs font-bold leading-tight">
                      Google
                      <br />
                      for Startups
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-auto text-[#47A248]">
                      <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296 4.604-3.254 4.291-11.375zM12 18.5c-.214-.307-.42-.62-.618-.939-.534-.86-.974-1.76-1.308-2.693-.163-.454-.298-.92-.405-1.394a9.7 9.7 0 01-.189-1.484c-.01-.634.024-1.268.1-1.897.152-1.25.515-2.472 1.068-3.604.265-.542.577-1.062.928-1.554.35.49.663 1.008.928 1.549.553 1.133.916 2.354 1.068 3.605.076.629.11 1.263.1 1.897-.013.502-.068 1.002-.165 1.495-.107.474-.242.94-.405 1.394-.334.933-.774 1.833-1.308 2.693-.198.319-.404.632-.618.939z"></path>
                    </svg>
                    <span className="text-gray-500 text-xs font-bold leading-tight">
                      MongoDB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-[55%] relative hidden lg:block overflow-visible pointer-events-none">
            <div className="relative flex items-center justify-center z-10 translate-x-[5%] py-8">
              <div className="relative w-[600px] transform translate-x-[-2%]">
                <div className="relative bg-black rounded-[1.5rem] p-[1.5%] shadow-2xl">
                  <div className="bg-white rounded-[1rem] overflow-hidden aspect-[16/10] flex justify-center items-center">
                    <span className="text-gray-400">Desktop Mockup Placeholder</span>
                  </div>
                </div>
                <div className="bg-gray-800 h-3 rounded-b-[1.5rem] shadow-lg mt-[-1px] mx-[2%]"></div>
                <div className="absolute -bottom-8 -right-12 w-[220px]">
                  <div className="relative bg-black rounded-[2rem] p-[4%] shadow-2xl border-[3px] border-gray-800">
                    <div className="bg-white rounded-[1.5rem] overflow-hidden aspect-[3/4.5] flex justify-center items-center">
                      <span className="text-gray-400 text-sm">Mobile Mockup</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:hidden w-full mt-10">
            <div className="bg-[#E0F7F3] rounded-[30px] p-6 h-64 flex justify-center items-center">
               <span className="text-gray-500">Responsive Mockup Placeholder</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
