"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Users, Calendar, FileText, Activity, Pill, DollarSign,
  Package, BarChart, Building2, Cloud, Smartphone, Bot,
  CheckCircle2, ArrowRight, Play, ArrowUpRight, PhoneCall, Clock
} from "lucide-react";
import Image from "next/image";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight lg:text-7xl text-gray-900">
                A <span className="text-primary">dental clinic</span> you can trust
              </h1>
              <p className="text-xl text-gray-500 max-w-[600px] leading-relaxed">
                Streamline your operations, enhance patient experience, and grow your practice with our comprehensive multi-tenant SaaS solution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-14 px-8 text-lg shadow-lg rounded-2xl bg-primary text-white hover:bg-primary/90">
                  Book Free Demo
                </Button>
                <Button size="lg" variant="ghost" className="h-14 px-8 text-lg text-primary hover:bg-primary/5 rounded-2xl border border-primary/20">
                  Browse Services
                </Button>
              </div>
            </div>
            
            <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none flex justify-center">
              <div className="relative w-80 h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl border-4 border-white bg-gray-100 z-10">
                 <img 
                    src="/hero-dentist.png" 
                    alt="Dental Clinic" 
                    className="object-cover w-full h-full"
                 />
              </div>
              
              {/* Floating Contact Card */}
              <Card className="absolute bottom-0 left-0 w-64 shadow-xl border-gray-100 z-20 rounded-2xl bg-white">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
                    <PhoneCall className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Contact Me</p>
                    <p className="text-sm font-bold text-gray-900">(555) 123-4567</p>
                    <a href="#" className="text-xs text-primary font-medium">Book an appointment</a>
                  </div>
                </CardContent>
              </Card>

              {/* Floating Hours Card */}
              <Card className="absolute top-0 right-0 w-64 shadow-xl border-gray-100 z-20 rounded-2xl bg-white">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Open Hours</p>
                    <p className="text-sm font-bold text-gray-900">Mon-Fri: 8AM-6PM</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Feature Cards Section */}
      <section className="py-32 bg-gray-50/50" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-primary font-semibold tracking-wider uppercase text-sm mb-3">Core Features</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Everything you need to run your clinic</h3>
            <p className="text-xl text-gray-500">A complete suite of tools designed specifically for modern dental practices.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { icon: Users, title: "Patient Management", desc: "Comprehensive profiles, medical history, and seamless onboarding." },
              { icon: Calendar, title: "Appointment Scheduling", desc: "Smart calendar with drag-and-drop, reminders, and online booking." },
              { icon: Activity, title: "Dental Chart", desc: "Interactive 3D odontograms and precise clinical notes." },
              { icon: FileText, title: "Treatment Plans", desc: "Create, share, and track multi-stage treatment plans." },
              { icon: Pill, title: "Digital Prescriptions", desc: "Generate and send secure e-prescriptions instantly." },
              { icon: DollarSign, title: "Billing & Invoices", desc: "Automated invoicing, insurance claims, and payment tracking." },
              { icon: Package, title: "Inventory Management", desc: "Track supplies, set low-stock alerts, and manage orders." },
              { icon: BarChart, title: "Reports & Analytics", desc: "Actionable insights into revenue, patient retention, and growth." },
              { icon: Building2, title: "Multi-Clinic Support", desc: "Manage multiple branches from a single unified dashboard." },
              { icon: Cloud, title: "Cloud Backup", desc: "Bank-grade security with automated daily backups." },
              { icon: Smartphone, title: "Mobile Apps", desc: "Native iOS and Android apps for doctors and patients." },
              { icon: Bot, title: "AI Assistant", desc: "AI-driven scheduling optimization and clinical insights." }
            ].map((feature, i) => (
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.05 } } }}
                key={i}
              >
                <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 border-gray-100 hover:border-primary/20 group">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="py-32 border-y border-gray-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-primary font-semibold tracking-wider uppercase text-sm mb-3">Workflow</h2>
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Built for simplicity. <br/> Designed for growth.</h3>
                <p className="text-xl text-gray-500">Get your entire practice online in minutes, not weeks. Our intuitive onboarding process ensures a frictionless transition.</p>
              </div>

              <div className="space-y-6">
                {[
                  { step: "1", title: "Register Clinic", desc: "Sign up and configure your clinic details instantly." },
                  { step: "2", title: "Setup Staff", desc: "Add doctors, receptionists, and assign roles." },
                  { step: "3", title: "Manage Patients", desc: "Import existing records or onboard new patients seamlessly." },
                  { step: "4", title: "Grow Your Practice", desc: "Leverage analytics and automated marketing to scale." }
                ].map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    key={i} className="flex gap-6"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border border-primary/20">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-500">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-[3rem] blur-3xl -z-10" />
               <div className="bg-white rounded-[2rem] border border-gray-200/50 shadow-2xl p-2 aspect-[4/5] relative overflow-hidden flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                       <Bot className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Interactive Demo</h3>
                    <p className="text-gray-500 max-w-[250px] mx-auto">Experience the platform live without signing up.</p>
                    <Button className="mt-4 rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">Start Interactive Tour</Button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pricing */}
      <section className="py-32 bg-gray-50/50" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-primary font-semibold tracking-wider uppercase text-sm mb-3">Pricing</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Simple, transparent pricing</h3>
            <p className="text-xl text-gray-500">No hidden fees. Scale your plan as your clinic grows.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all flex flex-col">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-bold text-gray-900">Starter</CardTitle>
                <CardDescription className="text-base mt-2">Perfect for solo practitioners.</CardDescription>
                <div className="my-6">
                  <span className="text-5xl font-extrabold text-gray-900">$49</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <Button className="w-full h-12 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-semibold text-lg" variant="secondary">
                  Start Free Trial
                </Button>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1">
                <ul className="space-y-4">
                  {['1 Doctor', 'Unlimited Patients', 'Basic Scheduling', 'Dental Charting', 'Email Support'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="bg-gray-900 border-gray-800 text-white hover:shadow-2xl hover:shadow-primary/20 transition-all flex flex-col relative scale-105 z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide shadow-lg">
                MOST POPULAR
              </div>
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-bold text-white">Professional</CardTitle>
                <CardDescription className="text-gray-400 text-base mt-2">For growing dental clinics.</CardDescription>
                <div className="my-6">
                  <span className="text-5xl font-extrabold text-white">$149</span>
                  <span className="text-gray-400">/mo</span>
                </div>
                <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 font-semibold text-lg">
                  Start Free Trial
                </Button>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1">
                <ul className="space-y-4">
                  {['Up to 5 Doctors', 'Advanced Analytics', 'SMS Reminders', 'Inventory Management', 'Priority 24/7 Support'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all flex flex-col">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-bold text-gray-900">Enterprise</CardTitle>
                <CardDescription className="text-base mt-2">For multi-branch hospital chains.</CardDescription>
                <div className="my-6">
                  <span className="text-5xl font-extrabold text-gray-900">Custom</span>
                </div>
                <Button className="w-full h-12 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-semibold text-lg" variant="secondary">
                  Contact Sales
                </Button>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1">
                <ul className="space-y-4">
                  {['Unlimited Everything', 'Custom Integrations', 'Dedicated Account Manager', 'White-label Mobile App', 'SLA Guarantee'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-primary font-semibold tracking-wider uppercase text-sm mb-3">FAQ</h2>
            <h3 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h3>
          </div>
          
          <Accordion className="w-full text-lg">
            {[
              { q: "Is my patient data secure?", a: "Yes. We use AES-256 encryption, automatic daily backups, and are fully HIPAA compliant." },
              { q: "Can I migrate from another software?", a: "Absolutely! Our team provides free migration assistance to transfer your data seamlessly without downtime." },
              { q: "Do you offer a free trial?", a: "Yes, we offer a 14-day full-featured free trial with no credit card required." },
              { q: "Can I manage multiple clinics?", a: "Yes, our Professional and Enterprise plans support multi-location management from a single unified dashboard." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-gray-200 py-2">
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-primary transition-colors text-xl">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-lg leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 6. Call to Action */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-blue-600/30 mix-blend-overlay" />
        <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to modernize your dental clinic?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Join thousands of modern dental practices using DentalSaaS to grow their business and provide exceptional patient care.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg rounded-2xl bg-white text-gray-900 hover:bg-gray-100 shadow-xl transition-transform hover:-translate-y-1">
              Book Free Demo
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-2xl border-white/20 text-white hover:bg-white/10 transition-transform hover:-translate-y-1">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
