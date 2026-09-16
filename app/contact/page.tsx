"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ContactPage() {
  const { lang } = useLanguage();
  const isId = lang === "id";

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <div className="border-b border-rule pb-8">
          <h1 className="font-display text-4xl text-ink font-normal tracking-tight">
            {isId ? "Hubungi Kami" : "Contact Us"}
          </h1>
          <p className="mt-3 text-base text-ink-muted">
            {isId
              ? "Punya masukan, saran fitur baru, atau pertanyaan teknis seputar ncpdf? Kami siap mendengar."
              : "Have feedback, feature requests, or technical inquiries about ncpdf? We'd love to hear from you."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-4 text-xs sm:text-sm text-ink-muted">
            <div className="p-4 bg-surface border border-rule rounded-lg space-y-3">
              <div className="flex items-center gap-2 font-medium text-ink">
                <Mail className="w-4 h-4 text-accent" />
                <span>{isId ? "Email Dukungan" : "Support Email"}</span>
              </div>
              <a
                href="mailto:nicoopedia.dev@gmail.com"
                className="font-mono text-xs text-accent hover:underline block"
              >
                nicoopedia.dev@gmail.com
              </a>
              <p className="text-xs text-ink-muted leading-relaxed">
                {isId
                  ? "Kami merespon pesan teknis dan saran perbaikan secepatnya."
                  : "We respond to technical questions and feature requests as quickly as possible."}
              </p>
            </div>

            <div className="p-4 bg-surface border border-rule rounded-lg space-y-3">
              <div className="flex items-center gap-2 font-medium text-ink">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>{isId ? "FAQ & Komunitas" : "Community & Issues"}</span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                {isId
                  ? "Ingin berkontribusi atau melaporkan kendala pada alat tertentu? Anda juga dapat membuka issue di repositori proyek kami."
                  : "Want to contribute or report a bug with a specific tool? You can also open an issue on our project repository."}
              </p>
            </div>
          </div>

          <div className="md:col-span-7">
            <Card className="border-rule bg-surface">
              <CardContent className="p-6">
                {submitted ? (
                  <div className="text-center py-8 space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
                    <h3 className="font-serif text-lg text-ink">
                      {isId ? "Pesan Terkirim!" : "Message Sent!"}
                    </h3>
                    <p className="text-xs text-ink-muted max-w-xs mx-auto">
                      {isId
                        ? "Terima kasih atas masukan Anda. Tim kami akan meninjau pesan Anda secepatnya."
                        : "Thank you for reaching out. Our team will review your message shortly."}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs mt-2"
                      onClick={() => {
                        setSubmitted(false);
                        setMessage("");
                      }}
                    >
                      {isId ? "Kirim Pesan Lain" : "Send Another Message"}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="font-medium text-ink block mb-1">
                        {isId ? "Nama Lengkap" : "Full Name"}
                      </label>
                      <Input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isId ? "Nama Anda" : "Your Name"}
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-ink block mb-1">
                        {isId ? "Alamat Email" : "Email Address"}
                      </label>
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-ink block mb-1">
                        {isId ? "Pesan atau Saran" : "Message or Feedback"}
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          isId
                            ? "Tuliskan saran atau kendala yang Anda alami..."
                            : "Write your message, feedback, or issue..."
                        }
                        className="w-full p-2.5 text-xs bg-surface rounded border border-rule text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>

                    <Button type="submit" className="w-full text-xs">
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      {isId ? "Kirim Pesan" : "Send Message"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
