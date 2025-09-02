// src/app/(hydrogen)/support/page.tsx
import React from 'react'
import SupportTable from './SupportTable'

export default async function SupportPage() {
  // 🔒 Estático por enquanto. Depois, troque por getServerSession + fetchs da sua API.
  const supports = [
    {
      ticket: '100234',
      subject: 'Problema ao gerar QR Code PIX',
      status: 1, // 0 open, 1 answered, 2 customer reply, 3 closed
      priority: 3, // 1 low, 2 medium, 3 high
      last_reply: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h atrás
    },
    {
      ticket: '100235',
      subject: 'Webhook não está recebendo callbacks',
      status: 0,
      priority: 2,
      last_reply: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25h atrás
    },
    {
      ticket: '100236',
      subject: 'Como alterar tipo de cobrança (Adicionar/Descontar)?',
      status: 2,
      priority: 1,
      last_reply: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15min atrás
    },
    {
      ticket: '100237',
      subject: 'Erro 422 ao criar boleto',
      status: 3,
      priority: 2,
      last_reply: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 dias
    },
  ]

  return <SupportTable initialSupports={supports} />
}
