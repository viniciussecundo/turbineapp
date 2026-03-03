import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  Send,
  Building2,
  User,
  Mail,
  Phone,
  MessageSquare,
  Instagram,
  Globe,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useData, LeadOrigin } from "@/contexts/DataContext";

const originOptions: {
  value: LeadOrigin;
  label: string;
  icon: typeof Globe;
}[] = [
  { value: "site", label: "Site", icon: Globe },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Users },
  { value: "indicacao", label: "Indicação", icon: Users },
  { value: "google", label: "Google", icon: Globe },
  { value: "outro", label: "Outro", icon: Globe },
];

export default function CadastroPublico() {
  const { addLead } = useData();
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("t");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    origin: "site" as LeadOrigin,
    notes: "",
    followers: "",
    posts: "",
    monthlyBudget: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tenantId) {
      setError("Link de cadastro inválido. Solicite um novo link.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newLead = await addLead(
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company || undefined,
          origin: formData.origin,
          notes: formData.notes || undefined,
          followers: formData.followers
            ? parseInt(formData.followers)
            : undefined,
          posts: formData.posts ? parseInt(formData.posts) : undefined,
          monthlyBudget: formData.monthlyBudget
            ? parseFloat(formData.monthlyBudget)
            : undefined,
        },
        true,
        tenantId,
      );

      if (newLead) {
        setIsSubmitted(true);
      } else {
        setError("Erro ao enviar cadastro. Tente novamente.");
      }
    } catch {
      setError("Erro ao enviar cadastro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="glass rounded-2xl p-8 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-3">
              Cadastro Realizado!
            </h1>
            <p className="text-muted-foreground mb-6">
              Obrigado pelo seu interesse! Nossa equipe entrará em contato em
              breve.
            </p>
            <div className="text-sm text-muted-foreground/60">
              Você pode fechar esta página.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 glow-primary">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Turbine seu Negócio
          </h1>
          <p className="text-muted-foreground">
            Preencha o formulário abaixo e entraremos em contato
          </p>
        </div>

        {/* Form Card */}
        <div
          className="glass rounded-2xl p-6 card-shadow animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: "100ms" }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <User className="w-4 h-4 text-primary" />
                Nome Completo *
              </Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Seu nome completo"
                className="bg-secondary/50 border-white/10 focus:border-primary/50"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-primary" />
                E-mail *
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="seu@email.com"
                className="bg-secondary/50 border-white/10 focus:border-primary/50"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-primary" />
                Telefone *
              </Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(11) 99999-9999"
                className="bg-secondary/50 border-white/10 focus:border-primary/50"
              />
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label
                htmlFor="company"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-primary" />
                Empresa
              </Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="Nome da sua empresa (opcional)"
                className="bg-secondary/50 border-white/10 focus:border-primary/50"
              />
            </div>

            {/* Como nos conheceu */}
            <div className="space-y-2">
              <Label
                htmlFor="origin"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Globe className="w-4 h-4 text-primary" />
                Como nos conheceu? *
              </Label>
              <Select
                value={formData.origin}
                onValueChange={(value: LeadOrigin) =>
                  setFormData({ ...formData, origin: value })
                }
              >
                <SelectTrigger className="bg-secondary/50 border-white/10">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  {originOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mensagem */}
            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-primary" />
                Mensagem
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Conte-nos sobre seu projeto ou necessidade (opcional)"
                className="bg-secondary/50 border-white/10 focus:border-primary/50 min-h-[100px] resize-none"
              />
            </div>

            {/* Dados de Tráfego */}
            <div className="border-t border-white/10 pt-4 mt-2">
              <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Dados do seu perfil (opcional)
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="followers"
                    className="text-xs text-muted-foreground"
                  >
                    Seguidores
                  </Label>
                  <Input
                    id="followers"
                    type="number"
                    value={formData.followers}
                    onChange={(e) =>
                      setFormData({ ...formData, followers: e.target.value })
                    }
                    placeholder="Ex: 5000"
                    className="bg-secondary/50 border-white/10 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="posts"
                    className="text-xs text-muted-foreground"
                  >
                    Nº de Posts
                  </Label>
                  <Input
                    id="posts"
                    type="number"
                    value={formData.posts}
                    onChange={(e) =>
                      setFormData({ ...formData, posts: e.target.value })
                    }
                    placeholder="Ex: 120"
                    className="bg-secondary/50 border-white/10 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="monthlyBudget"
                    className="text-xs text-muted-foreground"
                  >
                    Orçamento/Mês
                  </Label>
                  <Input
                    id="monthlyBudget"
                    type="number"
                    value={formData.monthlyBudget}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyBudget: e.target.value,
                      })
                    }
                    placeholder="R$ 0"
                    className="bg-secondary/50 border-white/10 focus:border-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gradient-primary hover:opacity-90 text-white font-medium py-6 text-base"
            >
              <Send className="w-5 h-5 mr-2" />
              {isSubmitting ? "Enviando..." : "Enviar Cadastro"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Ao enviar, você concorda em receber contato da nossa equipe.
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground/60">
          Powered by{" "}
          <span className="gradient-text font-semibold">Turbine</span>
        </div>
      </div>
    </div>
  );
}
