import { Mail, Clock, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    if (!accessKey) {
      toast.error('Configuration Error: Web3Forms API key is missing.');
      setIsSubmitting(false);
      return;
    }

    // only allow the contact form from our domain (or localhost for dev)
    const allowedDomains = ['corpusai.datanestx.tech', 'localhost', '127.0.0.1'];
    if (!allowedDomains.includes(window.location.hostname)) {
      toast.error('Security restriction: Contact form can only be sent from corpusai.datanestx.tech');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", accessKey);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Message sent! We'll get back to you within 24 hours.");
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(data.message || "Failed to send message.");
      }
    } catch (error) {
      toast.error("An error occurred while sending your message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32">
      <div className="container max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 tracking-tight">Contact</h2>
          <p className="text-muted-foreground">Questions? Reach out — we respond within 24 hours.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: Mail, label: 'Email', value: 'contact@corpusai.datanestx.tech', href: 'mailto:contact@corpusai.datanestx.tech' },
              { icon: Clock, label: 'Response', value: 'Within 24 hours' },
              { icon: Headphones, label: 'Hours', value: 'Mon–Fri, 9AM–6PM UTC' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-medium hover:text-primary transition-colors">{item.value}</a>
                  ) : (
                    <p className="text-sm font-medium">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3 p-6 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Name</label>
                  <Input type="text" name="name" placeholder="John Doe" required className="h-10 rounded-lg text-sm bg-background/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <Input type="email" name="email" placeholder="john@example.com" required className="h-10 rounded-lg text-sm bg-background/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Message</label>
                <Textarea name="message" placeholder="How can we help?" required rows={4} className="rounded-lg text-sm resize-none bg-background/50" />
              </div>
              <Button type="submit" className="w-full h-10 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white border-0 shadow-sm shadow-purple-500/10" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
