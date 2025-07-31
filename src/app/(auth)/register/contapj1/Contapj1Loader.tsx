// src/app/(auth)/register/contapj1/Contapj1Loader.tsx
import Contapj1Form from './Contapj1Form';

interface InitialData {
  pageTitle: string;
  countries: Record<string, { country: string; dial_code: string }>;
  mobile_code: string;
  preCadastroId: number;
}

// SEM 'use client' — agora Server Component
export default async function Contapj1Loader() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(
    `${API}/register/contapj1`,
    {
      method: 'GET',       // GET é o que a API espera
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    }
  );

  if (!res.ok) {
    throw new Error(`Erro ao carregar dados iniciais: HTTP ${res.status}`);
  }

  const initialData = (await res.json()) as InitialData;
  return <Contapj1Form initialData={initialData} />;
}
