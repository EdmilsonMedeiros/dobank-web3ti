// src/app/(hydrogen)/user/transfer/pix/page.tsx
import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import PixTransfer from './PixTransfer'

export default async function PixTransferPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return <p>Você precisa estar logado.</p>
  }

  // --------- DADOS MOCKADOS (sem API) ----------
  // Simula permissões/flags do usuário
  const user = {
    id: 1,
    name: 'João Silva',
    balance: 2450.75,
    transferencia_pix_planilha: true, // habilita a aba "Importar Planilha"
    negociated_pix_payment: true,
    pix_fixed_charge: 1.99,
    pix_percent_charge: 1.7,
    my_user_beneficiarie_id: 22,
  }

  // Limites e taxas do gateway PIX
  const gateway = {
    fixed_charge: 2.50,
    percent_charge: 2.0,
  }

  const pix = {
    minimum_limit: 5.0,
    maximum_limit: 5000.0,
  }

  // Beneficiário do próprio usuário (botão "Transferir para minha conta")
  const myUserBeneficiary = {
    id: 22,
    account_name: 'João da Silva',
    bank: {
      name: 'Banco Exemplo S.A.',
      minimum_limit: 5.0,
      maximum_limit: 5000.0,
      daily_maximum_limit: 10000.0,
      monthly_maximum_limit: 50000.0,
      daily_total_transaction: 3,
      monthly_total_transaction: 20,
    },
  }

  // Lista de beneficiários recentes/outros
  const otherBeneficiaries = [
    {
      id: 101,
      bank: { name: 'Dobank_PIX', minimum_limit: 5, maximum_limit: 5000, daily_maximum_limit: 10000, monthly_maximum_limit: 50000, daily_total_transaction: 1, monthly_total_transaction: 5 },
      pix_key_type: 'EMAIL',
      pix_key: 'maria@example.com',
      account_name: 'Maria Oliveira',
      account_number: '',
    },
    {
      id: 102,
      bank: { name: 'Banco do Brasil', minimum_limit: 5, maximum_limit: 5000, daily_maximum_limit: 8000, monthly_maximum_limit: 40000, daily_total_transaction: 1, monthly_total_transaction: 10 },
      pix_key_type: 'CPF',
      pix_key: '111.222.333-44',
      account_name: 'Carlos Santos',
      account_number: '123456-7',
    },
  ]

  // Logs de importação (planilha)
  const jobLogs = [
    { id: 9001, status: 'finalizado', message: 'Importação concluída sem erros', created_at: '05/09/2025 10:12' },
    { id: 9002, status: 'erro', message: 'Linha 7 inválida: CPF mal formatado', created_at: '06/09/2025 14:40' },
  ]

  // Lista de bancos para autocomplete no formulário de Dados Bancários
  const otherBanks = [
    { code: '001', name: 'Banco do Brasil' },
    { code: '237', name: 'Bradesco' },
    { code: '341', name: 'Itaú' },
    { code: '104', name: 'Caixa Econômica Federal' },
    { code: '260', name: 'Nubank' },
  ]

  const langToMoney = { decimal: ',', thousands: '.', precision: 2, prefix: 'R$ ' }

  const otpEnabled = true // simulação de OTP habilitado

  return (
    <PixTransfer
      user={user}
      gateway={gateway}
      pix={pix}
      myUserBeneficiary={myUserBeneficiary}
      otherBeneficiaries={otherBeneficiaries}
      jobLogs={jobLogs}
      otherBanks={otherBanks}
      langToMoney={langToMoney}
      otpEnabled={otpEnabled}
    />
  )
}
