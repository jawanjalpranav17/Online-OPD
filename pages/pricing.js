import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/Footer";

export default function Pricing() {
  const handleBookDemo = (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const value = input?.value || '';
    const subject = encodeURIComponent('ClinX Demo Request');
    const body = encodeURIComponent(`Hi ClinX team, I'd like to book a demo. Contact: ${value}`);
    window.location.href = `mailto:support@clinx.com?subject=${subject}&body=${body}`;
  };
  return (
    <>
      <Head>
        <title>ClinX Pricing | Affordable Healthcare Management Solutions</title>
        <meta
          name="description"
          content="Discover affordable pricing plans for ClinX Hospital Management Software. Choose the best plan for your clinic or hospital."
        />
      </Head>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Simple, Transparent Pricing</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              Start with our <span className="font-bold text-green-600">free OPD management system</span> and add powerful modules as your practice grows.
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-6">
              No hidden fees. No surprises. Cancel anytime.
            </p>
            <div className="mb-6">
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white text-lg font-semibold rounded-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Start Free OPD, EMR
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </Link>
            </div>
            <div className="max-w-2xl mx-auto p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-base font-bold text-green-800">
                WhatsApp integration via third-party service (subscription required)
              </p>
            </div>
          </div>
        </section>

        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Card 1: OPD */}
              <div className="pricing-card free-card bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-green-500 relative hover-lift">
                <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  BASE APP
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">OPD Management</h3>
                  <div className="mb-6">
                    <div className="text-5xl font-bold text-green-600 mb-2">Free</div>
                    <div className="text-gray-600 font-semibold">Forever</div>
                  </div>
                  <div className="space-y-3 mb-8">
                    {[
                      'Patient registration & records',
                      'Appointment scheduling',
                      'Digital prescriptions',
                      'Billing & invoicing',
                      'Patient history tracking',
                      'Basic reports & analytics',
                      'Multi-user access',
                      'Data backup & security'
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <svg fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: Pharmacy */}
              <div className="pricing-card bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 hover-lift">
                <div className="p-8">
                  <div className="text-sm font-semibold text-blue-600 mb-2">ADD-ON MODULE</div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Pharmacy Management</h3>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">₹10,000<span className="text-lg">/year</span></div>
                  </div>
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="text-sm font-semibold text-gray-700">Includes everything in base app, plus:</div>
                  </div>
                  <div className="space-y-3 mb-8">
                    {[
                      'Inventory management',
                      'Stock alerts & notifications',
                      'Expiry tracking',
                      'Vendor management',
                      'Purchase orders',
                      'Pharmacy billing',
                      'Medicine database',
                      'Batch tracking',
                      'Profit/loss reports'
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <svg fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3: Website */}
              <div className="pricing-card bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 hover-lift">
                <div className="p-8">
                  <div className="text-sm font-semibold text-purple-600 mb-2">ADD-ON MODULE</div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Website & Online Presence</h3>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-purple-600 mb-2">₹10,000<span className="text-lg">/year</span></div>
                  </div>
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="text-sm font-semibold text-gray-700">Includes everything in base app, plus:</div>
                  </div>
                  <div className="space-y-3 mb-8">
                    {[
                      'Professional website (yourname.com)',
                      'Online appointment booking',
                      'SSL certificate included',
                      'Mobile-responsive design',
                      'SEO optimization',
                      'Monthly analytics reports'
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <svg fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 4: IPD */}
              <div className="pricing-card bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 hover-lift">
                <div className="p-8">
                  <div className="text-sm font-semibold text-teal-600 mb-2">ADD-ON MODULE</div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">IPD Management</h3>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-teal-600 mb-2">₹2,000<span className="text-lg">/bed/year</span></div>
                  </div>
                  <div className="space-y-3 mb-8">
                     {[
                      'Bed management & tracking',
                      'Admission & discharge',
                      'IPD billing',
                      'Nursing notes',
                      'Operation theater management',
                      'Ward management',
                      'Insurance claim forms',
                      'Patient transfer tracking',
                      'IPD analytics & reports'
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <svg fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5 text-teal-500 mr-3 mt-0.5 flex-shrink-0">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-12 border border-gray-200">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4 text-gray-900">Ready to Transform Your Practice?</h2>
                <p className="text-xl text-gray-600">
                  Start with our free OPD system today. Add modules anytime to unlock more features.
                </p>
              </div>
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleBookDemo} className="flex flex-col gap-4 sm:flex-row sm:gap-2 w-full">
                  <input type="text" placeholder="Enter your email or mobile number" className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" required />
                  <button type="submit" className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Book demo <i className="fa fa-arrow-right ml-2"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                { q: 'Is the OPD management really free forever?', a: 'Yes! Our core OPD management system is completely free with no time limits. You get full access to patient management, appointments, prescriptions, billing, and more.' },
                { q: 'Can I add modules later?', a: 'Absolutely! Start with the free OPD system and add Pharmacy, Website, or IPD modules whenever you\'re ready. Your data stays intact and everything integrates seamlessly.' },
                { q: 'How does IPD pricing work?', a: 'IPD management is priced per bed per year (₹3,000/bed/year or ₹250/bed/month). For example, a 10-bed facility would pay ₹30,000/year for complete IPD management.' },
                { q: 'Is there a setup fee?', a: 'No setup fees! The free OPD system is ready to use immediately. Paid modules include setup and training at no additional cost.' }
              ].map((faq, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
