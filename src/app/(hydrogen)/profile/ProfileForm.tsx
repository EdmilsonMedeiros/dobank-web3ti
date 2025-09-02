'use client'

import * as React from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { makeProfileSchema, ProfileFormValues } from '@/validators/profile.schema'

type Props = {
  initialData: {
    primeiroNome: string
    sobrenome: string
    email: string
    tipoPessoa: string
    cpfCnpj: string
    nomeBanco: string
    tipoConta: string
    nomeCompleto: string
    cpfCnpjConta: string
    agencia: string
    numeroConta: string
    digitoConta: string
    tipoChave: string
    chavePix: string
    imageUrl: string | null
    liberado_dados_bancarios: boolean
  }
  apiBaseUrl: string
  token: string
}

export default function ProfileForm({ initialData, apiBaseUrl, token }: Props) {
  const [preview, setPreview] = React.useState<string | null>(initialData.imageUrl)
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
  const [file, setFile] = React.useState<File | null>(null)

  const schema = React.useMemo(() => makeProfileSchema(initialData.liberado_dados_bancarios), [
    initialData.liberado_dados_bancarios,
  ])

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      primeiroNome: initialData.primeiroNome,
      sobrenome: initialData.sobrenome,
      // email/tipoPessoa/cpfCnpj são de exibição; não serão enviados
      email: initialData.email,
      tipoPessoa: initialData.tipoPessoa,
      cpfCnpj: initialData.cpfCnpj,

      nomeBanco: initialData.nomeBanco,
      tipoConta: initialData.tipoConta as ProfileFormValues['tipoConta'],
      nomeCompleto: initialData.nomeCompleto,
      cpfCnpjConta: initialData.cpfCnpjConta,
      agencia: initialData.agencia,
      numeroConta: initialData.numeroConta,
      digitoConta: initialData.digitoConta,

      tipoChave: (initialData.tipoChave || '') as ProfileFormValues['tipoChave'],
      chavePix: initialData.chavePix,
    },
  })

  const disabledBankPix = initialData.liberado_dados_bancarios

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(String(ev.target?.result ?? null))
    reader.readAsDataURL(f)
  }

  const onSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      // Monta FormData com os nomes que o backend espera
      const fd = new FormData()
      fd.append('firstname', values.primeiroNome)
      fd.append('lastname', values.sobrenome)

      // Campos bancários/PIX só são enviados se edição estiver liberada (mesma lógica do Blade)
      if (!disabledBankPix) {
        if (values.nomeBanco) fd.append('bank', values.nomeBanco)
        if (values.tipoConta) fd.append('short_name', values.tipoConta)
        if (values.nomeCompleto) fd.append('account_name', values.nomeCompleto)
        if (values.cpfCnpjConta) fd.append('cpf_cnpj', values.cpfCnpjConta)
        if (values.agencia) fd.append('bank_branch', values.agencia)
        if (values.numeroConta) fd.append('account_number', values.numeroConta)
        if (values.digitoConta) fd.append('account_digit', values.digitoConta)
        if (values.tipoChave) fd.append('pix_key_type', values.tipoChave)
        if (values.chavePix) fd.append('pix_key', values.chavePix)
      }

      if (file) {
        fd.append('image', file, file.name)
      }

      const res = await fetch(`${apiBaseUrl}/profile-setting`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          // NÃO defina Content-Type ao enviar FormData
        } as any,
        body: fd,
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || 'Falha ao atualizar perfil')
      }
      setSuccessMsg('Perfil atualizado com sucesso.')
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao salvar')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelCls = 'block text-sm text-gray-600 mb-1.5'
  const err = (m?: string) => m ? <p className="text-xs text-red-600 mt-1">{m}</p> : null

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between p-6 border-b">
        <h1 className="text-xl font-semibold">Perfil do Usuário</h1>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 relative">
            <Image
              src={preview || '/placeholder-avatar.png'}
              alt="Foto do perfil"
              fill
              className="rounded-lg object-cover"
            />
          </div>
          {/* Botão de upload */}
          <label className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer">
            Carregar foto
            <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onFileChange} />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8 max-w-3xl">
        {/* Dados do Perfil */}
        <section>
          <h2 className="text-lg font-medium mb-4">Editar dados do Perfil</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Primeiro Nome</label>
                <input className={inputCls} {...register('primeiroNome')} />
                {err(errors.primeiroNome?.message)}
              </div>
              <div>
                <label className={labelCls}>Sobrenome</label>
                <input className={inputCls} {...register('sobrenome')} />
                {err(errors.sobrenome?.message)}
              </div>
            </div>

            {/* Somente exibição (como no Blade, desabilitado) */}
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls + ' opacity-60'} value={initialData.email} disabled />
            </div>

            {/* Campos somente leitura (tipo pessoa / doc) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Tipo Pessoa</label>
                <select className={inputCls + ' opacity-60'} value={initialData.tipoPessoa} disabled>
                  <option value="">...</option>
                  <option value="pessoa_fisica">Pessoa Física</option>
                  <option value="pessoa_juridica">Pessoa Jurídica</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Document Number</label>
                <input className={inputCls + ' opacity-60'} value={initialData.cpfCnpj} disabled />
              </div>
            </div>
          </div>
        </section>

        {/* Dados Bancários */}
        <section>
          <h2 className="text-lg font-medium mb-4">Editar dados bancários</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nome do Banco</label>
                <input className={inputCls} disabled={disabledBankPix} {...register('nomeBanco')} />
                {err(errors.nomeBanco?.message)}
              </div>
              <div>
                <label className={labelCls}>Tipo da Conta *</label>
                <select className={inputCls} disabled={disabledBankPix} {...register('tipoConta')}>
                  <option value="">Escolha o tipo de conta</option>
                  <option value="CONTA_CORRENTE">Conta Corrente</option>
                  <option value="CONTA_POUPANCA">Poupança</option>
                  <option value="CONTA_PAGAMENTO">Conta Pagamento</option>
                  <option value="CONTA_FACIL">Conta Fácil</option>
                  <option value="ENTIDADES_PUBLICAS">Entidades Públicas</option>
                </select>
                {err(errors.tipoConta?.message)}
              </div>
            </div>

            <div>
              <label className={labelCls}>Nome Completo *</label>
              <input className={inputCls} disabled={disabledBankPix} {...register('nomeCompleto')} />
              {err(errors.nomeCompleto?.message)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>CPF/CNPJ *</label>
                <input className={inputCls} disabled={disabledBankPix} {...register('cpfCnpjConta')} />
                {err(errors.cpfCnpjConta?.message)}
              </div>
              <div>
                <label className={labelCls}>Agência (sem dígito) *</label>
                <input className={inputCls} disabled={disabledBankPix} {...register('agencia')} />
                {err(errors.agencia?.message)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Número da Conta *</label>
                <input className={inputCls} disabled={disabledBankPix} {...register('numeroConta')} />
                {err(errors.numeroConta?.message)}
              </div>
              <div>
                <label className={labelCls}>Dígito da Conta *</label>
                <input className={inputCls} disabled={disabledBankPix} {...register('digitoConta')} />
                {err(errors.digitoConta?.message)}
              </div>
            </div>
          </div>
        </section>

        {/* Dados PIX */}
        <section>
          <h2 className="text-lg font-medium mb-4">Editar dados PIX</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tipo de Chave</label>
              <select className={inputCls} disabled={disabledBankPix} {...register('tipoChave')}>
                <option value="">Escolha o tipo de chave</option>
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="TELEFONE">Telefone</option>
                <option value="EMAIL">Email</option>
                <option value="CHAVE_ALEATORIA">Chave Aleatoria</option>
              </select>
              {err(errors.tipoChave?.message)}
            </div>
            <div>
              <label className={labelCls}>Digite a chave</label>
              <input className={inputCls} disabled={disabledBankPix} {...register('chavePix')} />
              {err(errors.chavePix?.message)}
            </div>
          </div>
        </section>

        {!disabledBankPix && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
            >
              {submitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        )}

        {disabledBankPix && (
          <p className="text-sm text-gray-600">Edição de dados bancários/PIX bloqueada para este usuário.</p>
        )}

        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
        {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}
      </form>
    </div>
  )
}
