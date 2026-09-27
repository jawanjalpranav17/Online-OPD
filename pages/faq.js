import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/Footer';
import Head from 'next/head';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`ClinX Inquiry from ${contactForm.name}`);
    const body = encodeURIComponent(`Name: ${contactForm.name}\nEmail: ${contactForm.email}\nPhone: ${contactForm.phone}\n\n${contactForm.message}`);
    window.location.href = `mailto:support@clinx.com?subject=${subject}&body=${body}`;
    setContactSent(true);
    setContactForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setContactSent(false), 6000);
  };

  const faqs = [
    {
      question: "What is the difference between ClinX and any other aggregator?",
      answer: "At ClinX, we believe in leveraging the power of technology to improve the healthcare industry. Our platform utilizes state-of-the-art tools and techniques to streamline processes and provide a seamless experience for both healthcare professionals and patients."
    },
    {
      question: "How does ClinX help doctors in branding and digitalization?",
      answer: "We provide one-click launch of websites, complete CMS, and custom theme selection to help doctors establish a strong digital presence and brand identity."
    },
    {
      question: "How much internet bandwidth is required to use ClinX?",
      answer: "ClinX is designed to be lightweight and efficient, working smoothly even on standard broadband connections typical for clinics and hospitals."
    },
    {
      question: "How does ClinX guarantee security?",
      answer: "We use industry-standard encryption, secure cloud infrastructure, and regular security audits to ensure your data and patient information are always protected."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>ClinX | Frequently Asked Questions - Healthcare Management Solutions</title>
        <meta name="description" content="Find answers to common questions about ClinX Hospital Management Software. Learn about our features, security, and more." />
      </Head>
      
      <Navbar />

      <main>
        <section className="faq-section py-24 bg-gradient-to-b from-neutral-50 to-white">
          <div className="container mx-auto px-4">
            <div className="faq-title text-center mb-12">
              <span className="text-lg text-secondary font-semibold">FAQ</span>
              <h1 className="text-4xl font-bold text-neutral-900 mt-2">
                Frequently Asked Questions
              </h1>
            </div>

            <div className="max-w-4xl mx-auto">
              <ul className="space-y-4">
                {faqs.map((faq, index) => (
                  <li key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-neutral-100 transition-all hover:shadow-lg">
                    <button 
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    >
                      <span className={`text-xl font-semibold transition-colors ${openIndex === index ? 'text-primary' : 'text-neutral-800'}`}>
                        {faq.question}
                      </span>
                      <svg 
                        className={`w-6 h-6 transform transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-primary' : 'text-secondary'}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="p-6 pt-0 text-neutral-600 leading-relaxed border-t border-neutral-50">
                        {faq.answer}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="contact-area py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="section-title text-center mb-12">
              <h2 className="text-3xl font-bold text-primary">Ready to Get Started?</h2>
              <p className="text-secondary text-lg mt-2">
                Transform your healthcare practice with ClinX today.
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="w-full max-w-2xl px-4">
                <div className="p-8 bg-gradient-to-br from-neutral-50 to-white rounded-2xl shadow-xl border border-neutral-100">
                  {contactSent && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <p className="text-emerald-700 font-medium">Message sent! Your email client has been opened. We'll get back to you shortly.</p>
                    </div>
                  )}
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div>
                      <input 
                        type="text" 
                        placeholder="What's Your Name" 
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <input 
                        type="email" 
                        placeholder="Your email address here" 
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Mobile Number" 
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <textarea 
                        rows="4" 
                        placeholder="Write your message here" 
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                    >
                      Submit Now
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
