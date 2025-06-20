import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { env } from "@/env.mjs";
import PaymentForm from "@shared/payments/payment-form";
import RecentOrder from "@shared/payments/recent-order";

export default async function PaymentsPage() {
  // 1. Verifica sessão
  const session = await getServerSession(authOptions);
  if (!session) {
    return <p>Você precisa estar logado.</p>;
  }

  // 2. Pega o token de acesso
  const token = session.user.accessToken;

  // 3. Faz fetch dos dados do usuário
  const apiBase = env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${apiBase}/user/billets`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Erro ao buscar dados do usuário");
  }

  // 4. Extrai user e suas transações
  const { data: billets } = (await res.json()) as {
    success: boolean;
    pageTitle: string;
    data: Array<{
      id: number;
      barcode: string;
      valor: string;
      status: string;
      created_at: string;
      updated_at: string;
      lote_id: string;
    }>;
  };

  return (
    <div className="@container space-y-6">
      <PaymentForm />

      <RecentOrder
        className="w-full"
        transactions={billets}
      />
    </div>
  );
}
