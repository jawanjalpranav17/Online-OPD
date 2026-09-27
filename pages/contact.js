import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/Footer';
import Head from 'next/head';
import { CheckCircle } from 'lucide-react';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // No backend for messages — open the user's mail client with the message prefilled
    const subject = encodeURIComponent(`ClinX Demo Request from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`);
    window.location.href = `mailto:support@clinx.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSubmitted(false), 6000);
  };
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>ClinX | Contact Us - Get in Touch with Our Healthcare Solutions Team</title>
        <meta name="description" content="Contact ClinX for healthcare management solutions. Get support, ask questions, or request a demo for your clinic or hospital." />
      </Head>

      <Navbar />

      <main>
        {/* Contact Info Section */}
        <section className="contact-box pt-24 pb-20 bg-gradient-to-b from-neutral-50 to-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8">
              {/* Address Card */}
              <div className="w-full lg:w-1/3 md:w-1/2 p-8 bg-white rounded-2xl shadow-xl border border-neutral-100 text-center transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">Address</h3>
                <p className="text-neutral-600 leading-relaxed">
                  13th Floor, Building Number 9, WeWork, K Raheja Mindspace, Survey No. 64, Madhapur, Hyderabad, Telangana 500081
                </p>
              </div>

              {/* Email Card */}
              <div className="w-full lg:w-1/3 md:w-1/2 p-8 bg-white rounded-2xl shadow-xl border border-neutral-100 text-center transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-2xl mb-6">
                  <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">Email</h3>
                <p className="text-secondary font-medium mt-1">
                  <a 
                    href="mailto:support@clinx.com" 
                    className="hover:text-primary transition-colors"
                  >
                    support@clinx.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="contact-area pb-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="section-title text-center mb-12">
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">Ready to Get Started?</h2>
              <p className="text-secondary text-lg mt-2">
                Transform your healthcare practice with ClinX today. Reach out to us for a demo or support.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-2xl px-4">
                <div className="p-8 bg-gradient-to-br from-neutral-50 to-white rounded-3xl shadow-2xl border border-neutral-100">
                  {submitted && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                      <p className="text-emerald-700 font-medium">Message sent! Your email client has been opened. We'll get back to you shortly.</p>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700 ml-1">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="What's Your Name" 
                          className="w-full px-5 py-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white/50"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700 ml-1">Email Address</label>
                        <input 
                          type="email" 
                          placeholder="Your email address here" 
                          className="w-full px-5 py-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white/50"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-700 ml-1">Mobile Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. +91 98765 43210" 
                        className="w-full px-5 py-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white/50"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-700 ml-1">Message</label>
                      <textarea 
                        rows="5" 
                        placeholder="Tell us about your clinic or hospital needs..." 
                        className="w-full px-5 py-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white/50 resize-none"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit" 
                        className="w-full py-5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                      >
                        Send Message
                      </button>
                    </div>
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

export default ContactPage;
