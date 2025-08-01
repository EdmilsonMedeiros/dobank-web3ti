'use client'
import { useState } from 'react'
import Image from 'next/image'

interface FormData {
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
  chavePixCpf: string
  image: string | null
}

interface ProfileFormProps {
  initialData: FormData
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState<FormData>(initialData)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: chamar sua API de update aqui
    console.log('vai salvar:', formData)
  }

  const inputClass =
    'w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelClass = 'block text-sm text-gray-600 mb-1.5'

  return (
    <div className="">
      <div className="bg-white rounded-xl shadow-sm">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b">
          <h1 className="text-xl font-semibold">Perfil do Usuário</h1>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 relative">
              <Image
                src={
                  formData.image ??
                  'https://isomorphic-furyroad.s3.amazonaws.com/public/avatars/avatar-11.webp'
                }
                alt="Foto do perfil"
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700">
              Carregar foto
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-w-3xl mx-auto"
        >
          {/* Dados Pessoais */}
          <div>
            <h2 className="text-lg font-medium mb-4">
              Editar dados do Perfil
            </h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Primeiro Nome</label>
                  <input
                    type="text"
                    name="primeiroNome"
                    value={formData.primeiroNome}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Sobrenome</label>
                  <input
                    type="text"
                    name="sobrenome"
                    value={formData.sobrenome}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tipo Pessoa *</label>
                  <select
                    name="tipoPessoa"
                    value={formData.tipoPessoa}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="Pessoa Física">Pessoa Física</option>
                    <option value="Pessoa Jurídica">Pessoa Jurídica</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    Número do CPF/CNPJ
                  </label>
                  <input
                    type="text"
                    name="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dados Bancários */}
          <div>
            <h2 className="text-lg font-medium mb-4">
              Editar dados bancários
            </h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nome do Banco</label>
                  <input
                    type="text"
                    name="nomeBanco"
                    value={formData.nomeBanco}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tipo da Conta *</label>
                  <select
                    name="tipoConta"
                    value={formData.tipoConta}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="CONTA_CORRENTE">
                      CONTA CORRENTE
                    </option>
                    <option value="CONTA_POUPANCA">
                      CONTA POUPANÇA
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Nome Completo *</label>
                <input
                  type="text"
                  name="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>
                    Agência (sem dígito) *
                  </label>
                  <input
                    type="text"
                    name="agencia"
                    value={formData.agencia}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Número da Conta *
                  </label>
                  <input
                    type="text"
                    name="numeroConta"
                    value={formData.numeroConta}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Dígito da Conta *
                  </label>
                  <input
                    type="text"
                    name="digitoConta"
                    value={formData.digitoConta}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dados PIX */}
          <div>
            <h2 className="text-lg font-medium mb-4">
              Editar dados PIX
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tipo de Chave</label>
                <select
                  name="tipoChave"
                  value={formData.tipoChave}
                  onChange={handleInputChange}
                  className={inputClass}
                >
                  <option value="CPF">CPF</option>
                  <option value="EMAIL">Email</option>
                  <option value="TELEFONE">Telefone</option>
                  <option value="ALEATORIA">
                    Chave Aleatória
                  </option>
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  Digite a chave *
                </label>
                <input
                  type="text"
                  name="chavePixCpf"
                  value={formData.chavePixCpf}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
