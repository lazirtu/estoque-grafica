import { useEffect, useState } from 'react'
import Login from './components/Login'
import { supabase } from './lib/supabase'

const menuItems = ['Início', 'Estoque', 'Entradas', 'Saídas']

type Material = {
  id: string
  name: string
  category: string
  control: string
  quantity: number
  minimum: number
  activeMeters?: number
  closedRolls: number
}

type Entry = {
  id: string
  material: string
  quantity: number
  date: string
  note: string
  createdAt: string
}

type Exit = {
  id: string
  material: string
  quantity: number
  date: string
  note: string
  createdAt: string
}

type Reminder = {
   id: string
  text: string
  author: string
  createdAt: string
  status: 'active' | 'deleted'
}


function App() {  
  const [user, setUser] = useState<any>(null)
  useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setUser(data.session?.user ?? null)
  })
}, [])


  const [page, setPage] = useState('Início')
  const [searchMaterial, setSearchMaterial] = useState('')
  const [showMaterialForm, setShowMaterialForm] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)
 const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
 const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null)
  const [newEntry, setNewEntry] = useState({
  material: '',
  quantity: '',
  date: '',
  note: '',
})
const [entries, setEntries] = useState<Entry[]>([])

const [entryError, setEntryError] = useState('')

useEffect(() => {
  if (!user) return

  async function loadEntries() {
    const { data, error } = await supabase
      .from('entries')
      .select(`
        id,
        quantity,
        date,
        note,
        created_at,
        materiais (
          name
        )
      `)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao carregar entradas:', error)
      return
    }

    setEntries(
      data.map((entry: any) => ({
        id: entry.id,
        material: entry.materiais?.name ?? '',
        quantity: Number(entry.quantity),
        date: entry.date,
        note: entry.note ?? '',
        createdAt: new Date(entry.created_at).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }))
    )
  }

  loadEntries()
}, [user])


const [newExit, setNewExit] = useState({
  material: '',
  quantity: '',
  date: '',
  note: '',
})

const [exitType, setExitType] = useState<'metros' | 'bobina'>('metros')

const [exits, setExits] = useState<Exit[]>([])
const [exitError, setExitError] = useState('')

useEffect(() => {
  if (!user) return

  async function loadExits() {
    const { data, error } = await supabase
      .from('exits')
      .select(`
        id,
        quantity,
        date,
        note,
        created_at,
        materiais (
          name
        )
      `)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao carregar saídas:', error)
      return
    }

    setExits(
      data.map((exit: any) => ({
        id: exit.id,
        material: exit.materiais?.name ?? '',
        quantity: Number(exit.quantity),
        date: exit.date,
        note: exit.note ?? '',
        createdAt: new Date(exit.created_at).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }))
    )
  }

  loadExits()
}, [user])


const [reminders, setReminders] = useState<Reminder[]>([])

useEffect(() => {
  if (!user) return

 async function loadReminders() {
  const { data, error } = await supabase
    .from('reminders')
    .select(`
      id,
      text,
      author,
      created_at,
      status
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao carregar lembretes:', error)
    return
  }

  setReminders(
    data.map((reminder: any) => ({
      id: reminder.id,
      text: reminder.text,
      author: reminder.author,
      createdAt: new Date(reminder.created_at).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: reminder.status,
    }))
  )
}
  loadReminders()
}, [user])

const [newReminder, setNewReminder] = useState({
  text: '',
  author: '',
})

const [selectedMonth, setSelectedMonth] = useState(
  new Date().toISOString().slice(0, 7)
)

const [showMonthlyHistory, setShowMonthlyHistory] = useState(false)

const monthlyEntries = entries.filter((entry) =>
  entry.date.startsWith(selectedMonth)
)

const monthlyExits = exits.filter((exit) =>
  exit.date.startsWith(selectedMonth)
)

const monthlyMovements = [
  ...monthlyEntries.map((entry) => ({
    id: `entry-${entry.id}`,
    type: 'Entrada' as const,
    material: entry.material,
    quantity: entry.quantity,
    date: entry.date,
    note: entry.note,
  })),

  ...monthlyExits.map((exit) => ({
    id: `exit-${exit.id}`,
    type: 'Saída' as const,
    material: exit.material,
    quantity: exit.quantity,
    date: exit.date,
    note: exit.note,
  })),
].sort((a, b) => b.date.localeCompare(a.date))

const totalMonthlyEntries = monthlyEntries.reduce(
  (total, entry) => total + entry.quantity,
  0
)

const totalMonthlyExits = monthlyExits.reduce(
  (total, exit) => total + exit.quantity,
  0
)

const totalMonthlyMovements =
  totalMonthlyEntries + totalMonthlyExits

const entryPercentage =
  totalMonthlyMovements > 0
    ? (totalMonthlyEntries / totalMonthlyMovements) * 100
    : 0


const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null)

const [showReminderHistory, setShowReminderHistory] = useState(false)


  const [materials, setMaterials] = useState<Material[]>([])
 useEffect(() => {
  if (!user) return

  async function loadMaterials() {
    const { data, error } = await supabase
      .from('materiais')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao carregar materiais:', error)
      return
    }

    setMaterials(
      data.map((material: any) => ({
        id: material.id,
        name: material.name,
        category: material.category,
        control: material.control,
        quantity: Number(material.quantity),
        minimum: Number(material.minimum),
        activeMeters:
          material.active_meters !== null
            ? Number(material.active_meters)
            : undefined,
        closedRolls: Number(material.closed_rolls ?? 0),
      }))
    )
  }

  loadMaterials()
}, [user])

 const [newMaterial, setNewMaterial] = useState({
  name: '',
  category: '',
  control: '',
  quantity: '',
  minimum: '',
  activeMeters: '',
  closedRolls: '',
})
 if (!user) {
  return <Login onLogin={(loggedUser) => setUser(loggedUser)} />
}

return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <nav className="border-b border-slate-200 bg-white">
  <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
    <div>
      <p className="text-lg font-bold text-slate-900">Estoque da Gráfica</p>
      <p className="text-xs text-slate-500">Controle de materiais</p>
    </div>

    <div className="flex gap-2">
      {menuItems.map((item) => (
       <button
  key={item}
  onClick={() => setPage(item)}
  className={`rounded-lg px-3 py-2 text-sm font-medium ${
    page === item
      ? 'bg-slate-900 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`}
>
  {item}
</button>
      ))}
    </div>
  </div>
</nav>
      <div className="mx-auto max-w-6xl">
       {page === 'Início' && ( 
        <div>
        <section className="rounded-2xl bg-slate-900 p-8 text-white shadow-lg"> 
          <p className="mb-2 text-sm font-medium text-emerald-400">
            Estoque da Gráfica
          </p>

          <h1 className="text-3xl font-bold">
            Bem-vindo ao seu controle de estoque 👋
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">
            Acompanhe seus materiais, entradas, saídas e os itens que precisam
            de reposição.
          </p>
        </section>

       <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">
        Materiais cadastrados
      </p>

      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        📦
      </div>
    </div>

    <p className="mt-4 text-3xl font-bold text-slate-900">
      {materials.length}
    </p>

    <p className="mt-1 text-xs text-slate-500">
      Total de materiais registrados
    </p>
  </div>

  <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:shadow-md">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">
        Materiais em estoque
      </p>

      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        ✓
      </div>
    </div>

    <p className="mt-4 text-3xl font-bold text-emerald-600">
      {materials.filter((material) => {
        if (material.control === 'Bobina com metragem restante') {
          return (material.closedRolls || 0) > 0
        }

        return (material.quantity || 0) > 0
      }).length}
    </p>

    <p className="mt-1 text-xs text-slate-500">
      Materiais com quantidade disponível
    </p>
  </div>

  <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm transition hover:shadow-md sm:col-span-2 lg:col-span-1">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">
        Abaixo do mínimo
      </p>

      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600">
        !
      </div>
    </div>

    <p className="mt-4 text-3xl font-bold text-red-600">
      {materials.filter((material) => {
        if (material.control === 'Bobina com metragem restante') {
          return (material.closedRolls || 0) < material.minimum
        }

        return (material.quantity || 0) < material.minimum
      }).length}
    </p>

    <p className="mt-1 text-xs text-slate-500">
      Materiais que precisam de atenção
    </p>
  </div>
</section>
                                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-xl font-bold text-slate-900">
        🔔 Lembretes
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Informações importantes para a equipe.
      </p>
    </div>

   <div className="flex items-center gap-2">
  <button
    onClick={() => setShowReminderHistory(true)}
    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
  >
    Histórico
  </button>

  <button
    onClick={() => setShowReminderForm(true)}
    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xl font-medium text-white hover:bg-slate-800"
  >
    +
  </button>
</div>
   </div>

  <div className="mt-6 space-y-3">
    {reminders.length === 0 ? (
      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
        <p className="text-sm text-slate-500">
          Nenhum lembrete cadastrado ainda.
        </p>
      </div>
    ) : (
     reminders
  .filter((reminder) => reminder.status === 'active')
  .slice(-3)
  .reverse()
  .map((reminder, index) => (
        <div
  key={index}
  className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:shadow-sm"
>
  <div className="flex items-start justify-between gap-4">
    <p className="leading-relaxed font-medium text-slate-900">
      {reminder.text}
    </p>

    <button
      onClick={() => setReminderToDelete(reminder)}
      className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
    >
      Excluir
    </button>
  </div>

  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm text-slate-500">
  <span>
    Por: <span className="font-medium text-slate-700">
      {reminder.author}
    </span>
  </span>

  <div className="text-right">
    <p>
      {reminder.createdAt.split(',')[0]}
    </p>

    <p className="mt-1 text-xs text-slate-400">
      Adicionado às {reminder.createdAt.split(',')[1]?.trim()}
    </p>
  </div>
</div>
</div>
        ))
    )}
  </div>

  {showReminderForm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Criar novo lembrete
          </h2>

          <button
            onClick={() => setShowReminderForm(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            ×
          </button>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium text-slate-700">
            Lembrete
          </label>

          <textarea
            rows={4}
            value={newReminder.text}
            onChange={(e) =>
              setNewReminder({
                ...newReminder,
                text: e.target.value,
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-500"
            placeholder="Digite o lembrete..."
          />
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6">
          <label className="text-sm font-medium text-slate-700">
            Autor
          </label>

          <input
            type="text"
            value={newReminder.author}
            onChange={(e) =>
              setNewReminder({
                ...newReminder,
                author: e.target.value,
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-slate-500"
            placeholder="Nome de quem escreveu"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setShowReminderForm(false)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
           onClick={async () => {
  if (!newReminder.text.trim() || !newReminder.author.trim()) {
    return
  }

  const { data, error } = await supabase
    .from('reminders')
    .insert({
      text: newReminder.text,
      author: newReminder.author,
      status: 'active',
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar lembrete:', error)
    alert('Erro ao criar lembrete.')
    return
  }

  setReminders([
    ...reminders,
    {
      id: data.id,
      text: data.text,
      author: data.author,
      createdAt: new Date(data.created_at).toLocaleString('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}),
      status: data.status,
    },
  ])

  setNewReminder({
    text: '',
    author: '',
  })

  setShowReminderForm(false)
}}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Criar lembrete
          </button>
        </div>
      </div>
    </div>
  )}

 {reminderToDelete && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <h2 className="text-xl font-bold text-slate-900">
        Excluir lembrete?
      </h2>

      <p className="mt-3 text-sm text-slate-600">
        Tem certeza que deseja excluir este lembrete?
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setReminderToDelete(null)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>

        <button
  onClick={async () => {
  if (!reminderToDelete) return

  const { error } = await supabase
    .from('reminders')
    .update({
      status: 'deleted',
    })
    .eq('id', reminderToDelete.id)

  if (error) {
    console.error('Erro ao excluir lembrete:', error)
    alert('Erro ao excluir lembrete.')
    return
  }

  setReminders(
    reminders.map((reminder) =>
      reminder.id === reminderToDelete.id
        ? { ...reminder, status: 'deleted' }
        : reminder
    )
  )

  setReminderToDelete(null)
}}
  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
>
  Excluir
</button>
      </div>
    </div>
  </div>
)}
{showReminderHistory && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          Histórico de lembretes
        </h2>

        <button
          onClick={() => setShowReminderHistory(false)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          ×
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {reminders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <p className="text-sm text-slate-500">
              Nenhum lembrete registrado no histórico.
            </p>
          </div>
        ) : (
          reminders.map((reminder, index) => (
            <div
              key={reminder.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="font-medium text-slate-900">
                {reminder.text}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                <span>Por: {reminder.author}</span>
                <span>{reminder.createdAt}</span>

                <span
                  className={
                    reminder.status === 'active'
                      ? 'font-medium text-emerald-600'
                      : 'font-medium text-red-600'
                  }
                >
                  {reminder.status === 'active'
                    ? 'Ativo'
                    : 'Excluído'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}

</section>
<section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-xl font-bold text-slate-900">
        📊 Resumo Mensal
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Histórico de entradas e saídas do mês selecionado.
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-slate-700">
        Mês
      </label>

      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
      />
    </div>
  </div>

  <div className="mt-6 grid gap-6 lg:grid-cols-2">
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
      <h3 className="text-sm font-semibold text-slate-700">
        Movimentação do mês
      </h3>

      <div className="mt-6 flex flex-col items-center">
        <div
  className="relative flex h-48 w-48 items-center justify-center rounded-full"
  style={{
    background: `conic-gradient(
      #10b981 0% ${entryPercentage}%,
      #ef4444 ${entryPercentage}% 100%
    )`,
  }}
>
  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-center shadow-sm">
    <div>
      <p className="text-xs text-slate-500">
        Total
      </p>

      <p className="text-lg font-bold text-slate-900">
        {totalMonthlyMovements}
      </p>
    </div>
  </div>
</div>

        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-xs text-emerald-700">
              Entradas
            </p>

            <p className="mt-1 text-lg font-bold text-emerald-700">
              {totalMonthlyEntries}
            </p>
          </div>

          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-xs text-red-700">
              Saídas
            </p>

            <p className="mt-1 text-lg font-bold text-red-700">
              {totalMonthlyExits}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
      <h3 className="text-sm font-semibold text-slate-700">
        Histórico do mês
      </h3>

      <div className="mt-4 space-y-3">
        {monthlyMovements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <p className="text-sm text-slate-500">
              Nenhuma movimentação registrada neste mês.
            </p>
          </div>
        ) : (
          monthlyMovements.slice(0, 4).map((movement) => (
            <div
              key={movement.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">
                    {movement.material}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {movement.note}
                  </p>
                </div>

                <span
                  className={
                    movement.type === 'Entrada'
                      ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'
                      : 'rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700'
                  }
                >
                  {movement.type}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                <span className="text-slate-500">
                  {new Date(
                    `${movement.date}T00:00:00`
                  ).toLocaleDateString('pt-BR')}
                </span>

                <span className="font-semibold text-slate-900">
                  {movement.quantity}
                </span>
              </div>
                        </div>
          ))
        )}

        {monthlyMovements.length > 4 && (
          <button
            onClick={() => setShowMonthlyHistory(true)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Ver histórico completo
          </button>
        )}
      </div>
    </div>
  </div>
</section>
{showMonthlyHistory && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Histórico completo
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Todas as movimentações do mês selecionado.
          </p>
        </div>

        <button
          onClick={() => setShowMonthlyHistory(false)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          ×
        </button>
      </div>

      <div className="mt-6 max-h-[60vh] space-y-3 overflow-y-auto pr-2">
        {monthlyMovements.map((movement) => (
          <div
            key={movement.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">
                  {movement.material}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {movement.note}
                </p>
              </div>

              <span
                className={
                  movement.type === 'Entrada'
                    ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'
                    : 'rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700'
                }
              >
                {movement.type}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
              <span className="text-slate-500">
                {new Date(
                  `${movement.date}T00:00:00`
                ).toLocaleDateString('pt-BR')}
              </span>

              <span className="font-semibold text-slate-900">
                {movement.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setShowMonthlyHistory(false)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
)}
        </div>
      )}

      {page === 'Estoque' && (
  <>
    {(showMaterialForm || editingMaterial) && (
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
         {editingMaterial ? 'Editar material' : 'Novo material'}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Cadastre um novo material no estoque.
        </p>

        <div className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Nome do material
            </label>

            <input
              type="text"
               value={newMaterial.name}
  onChange={(e) =>
    setNewMaterial({ ...newMaterial, name: e.target.value })
  }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              placeholder="Ex.: Tecido Branco"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Categoria
            </label>

            <input
              type="text"
              value={newMaterial.category}
onChange={(e) =>
  setNewMaterial({ ...newMaterial, category: e.target.value })
}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              placeholder="Ex.: Tecido"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Tipo de controle
            </label>

            <select
            value={newMaterial.control}
onChange={(e) =>
  setNewMaterial({ ...newMaterial, control: e.target.value })
}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            
            >
              <option value="" disabled>
                Selecione o tipo
              </option>
              <option>Bobina inteira</option>
              <option>Metragem</option>
              <option>Bobina com metragem restante</option>
              <option>Pote fechado</option>
              <option>Unidade simples</option>
            </select>
          </div>

          {newMaterial.control === 'Bobina com metragem restante' ? (
  <>
    <div>
      <label className="text-sm font-medium text-slate-700">
        Metragem restante da bobina ativa
      </label>

      <input
        type="number"
        value={newMaterial.activeMeters}
        onChange={(e) =>
          setNewMaterial({
            ...newMaterial,
            activeMeters: e.target.value,
          })
        }
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
        placeholder="0"
      />
    </div>

    <div>
      <label className="text-sm font-medium text-slate-700">
        Bobinas fechadas
      </label>

      <input
        type="number"
        value={newMaterial.closedRolls}
        onChange={(e) =>
          setNewMaterial({
            ...newMaterial,
            closedRolls: e.target.value,
          })
        }
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
        placeholder="0"
      />
    </div>

    <div>
      <label className="text-sm font-medium text-slate-700">
        Mínimo de bobinas fechadas
      </label>

      <input
        type="number"
        value={newMaterial.minimum}
        onChange={(e) =>
          setNewMaterial({
            ...newMaterial,
            minimum: e.target.value,
          })
        }
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
        placeholder="0"
      />
    </div>
  </>
) : (
  <>
    <div>
      <label className="text-sm font-medium text-slate-700">
        Quantidade atual
      </label>

      <input
        type="number"
        value={newMaterial.quantity}
        onChange={(e) =>
          setNewMaterial({
            ...newMaterial,
            quantity: e.target.value,
          })
        }
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
        placeholder="0"
      />
    </div>

    <div>
      <label className="text-sm font-medium text-slate-700">
        Quantidade mínima
      </label>

      <input
        type="number"
        value={newMaterial.minimum}
        onChange={(e) =>
          setNewMaterial({
            ...newMaterial,
            minimum: e.target.value,
          })
        }
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
        placeholder="0"
      />
    </div>
  </>
)}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowMaterialForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>

           <button
  onClick={async () => {
  if (editingMaterial) {
  const { data, error } = await supabase
    .from('materiais')
    .update({
      name: newMaterial.name,
      category: newMaterial.category,
      control: newMaterial.control,
      quantity: Number(newMaterial.quantity),
      minimum: Number(newMaterial.minimum),
      active_meters:
        newMaterial.activeMeters === ''
          ? null
          : Number(newMaterial.activeMeters),
      closed_rolls:
        newMaterial.closedRolls === ''
          ? 0
          : Number(newMaterial.closedRolls),
    })
    .eq('id', editingMaterial.id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao editar material:', error)
    alert('Erro ao editar material.')
    return
  }

  setMaterials(
    materials.map((item) =>
      item.id === editingMaterial.id
        ? {
            id: data.id,
            name: data.name,
            category: data.category,
            control: data.control,
            quantity: Number(data.quantity),
            minimum: Number(data.minimum),
            activeMeters:
              data.active_meters !== null
                ? Number(data.active_meters)
                : undefined,
            closedRolls: Number(data.closed_rolls ?? 0),
          }
        : item
    )
  )

  setEditingMaterial(null)
  setShowMaterialForm(false)
  return
}

  const { data, error } = await supabase
    .from('materiais')
    .insert({
      name: newMaterial.name,
      category: newMaterial.category,
      control: newMaterial.control,
      quantity: Number(newMaterial.quantity),
      minimum: Number(newMaterial.minimum),
      active_meters:
        newMaterial.activeMeters === ''
          ? null
          : Number(newMaterial.activeMeters),
      closed_rolls:
        newMaterial.closedRolls === ''
          ? 0
          : Number(newMaterial.closedRolls),
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao cadastrar material:', error)
    alert('Erro ao cadastrar material.')
    return
  }

  const material: Material = {
    id: data.id,
    name: data.name,
    category: data.category,
    control: data.control,
    quantity: Number(data.quantity),
    minimum: Number(data.minimum),
    activeMeters:
      data.active_meters !== null
        ? Number(data.active_meters)
        : undefined,
    closedRolls: Number(data.closed_rolls ?? 0),
  }

  setMaterials([...materials, material])

  setNewMaterial({
    name: '',
    category: '',
    control: '',
    quantity: '',
    minimum: '',
    activeMeters: '',
    closedRolls: '',
  })

  setShowMaterialForm(false)
}}
  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
>
 {editingMaterial ? 'Salvar alterações' : 'Salvar material'}
</button>
          </div>
        </div>
      </div>
    )}

     <section>
          <div className="mb-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Estoque
      </h1>

      <p className="mt-1 text-slate-500">
        Consulte a quantidade atual dos materiais.
      </p>
    </div>

    <div className="w-full sm:max-w-md">
     <input
  type="text"
  value={searchMaterial}
  onChange={(e) => setSearchMaterial(e.target.value)}
  placeholder="Pesquisar material..."
  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-slate-500"
/>
    </div>
  </div>

  <div className="mt-4">
  <button
  onClick={() => setShowMaterialForm(true)}
    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
  >
    + Novo material
  </button>
</div>
          </div>

          <div className="space-y-4">
           {materials
  .filter((material) =>
    material.name.toLowerCase().includes(searchMaterial.toLowerCase())
  )
  .map((material) => {
              const isLowStock =
  material.control === 'Bobina com metragem restante'
    ? material.closedRolls < material.minimum
    : material.quantity < material.minimum

              return (
                <div
                  key={material.name}
                  className={`rounded-2xl border bg-white p-5 shadow-sm ${
                    isLowStock ? 'border-red-300' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        {material.name}
                      </h2>

                     <p className="mt-1 text-sm text-slate-500">
  {material.category} • {material.control}
</p>

{isLowStock && (
  <span className="mt-2 inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
    ⚠ Abaixo do mínimo
  </span>
)}
                    </div>

                    <div className="flex gap-8">
                    {material.control === 'Bobina com metragem restante' ? (
  <>
    <div>
      <p className="text-xs text-slate-500">Bobina ativa</p>
      <p className="text-xl font-bold text-slate-900">
        {material.activeMeters} m
      </p>
    </div>

    <div>
      <p className="text-xs text-slate-500">Bobinas fechadas</p>
      <p className="text-xl font-bold text-slate-900">
        {material.closedRolls}
      </p>
    </div>

    <div>
      <p className="text-xs text-slate-500">Mínimo</p>
      <p className="text-xl font-bold text-slate-900">
        {material.minimum}
      </p>
    </div>
  </>
) : (
  <>
    <div>
      <p className="text-xs text-slate-500">Atual</p>
      <p
        className={`text-xl font-bold ${
          isLowStock ? 'text-red-600' : 'text-slate-900'
        }`}
      >
        {material.quantity}
      </p>
    </div>

    <div>
      <p className="text-xs text-slate-500">Mínimo</p>
      <p className="text-xl font-bold text-slate-900">
        {material.minimum}
      </p>
    </div>
  </>
)}
                    </div>
                    <div className="flex gap-2">
                    <button
                   onClick={() => {
  setEditingMaterial(material)
  setShowMaterialForm(false)

  setNewMaterial({
    name: material.name,
    category: material.category,
    control: material.control,
    quantity: String(material.quantity),
    minimum: String(material.minimum),
    activeMeters: String(material.activeMeters ?? ''),
    closedRolls: String(material.closedRolls ?? ''),
  })
}}
  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
>
  Editar
</button>
<button
onClick={() => {
  setMaterialToDelete(material)
}}
  className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
>
  Excluir
</button>
</div>
                  </div>

                  {isLowStock && (
                    <p className="mt-4 text-sm font-medium text-red-600">
                      Estoque abaixo do mínimo
                    </p>
                  )}
                </div>
              )
                        })}
          </div>
        </section>
      </>
      )}

       {page === 'Entradas' && (
        <section className="py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              Entradas
            </h1>

            <p className="mt-1 text-slate-500">
              Registre os materiais que entram no estoque.
            </p>
          </div>

         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <h2 className="text-lg font-bold text-slate-900">
    Registrar entrada
  </h2>

  <p className="mt-1 text-sm text-slate-500">
    Informe os dados do material que entrou no estoque.
  </p>

  <div className="mt-6 grid gap-4">
    <div>
      <label className="text-sm font-medium text-slate-700">
        Material
      </label>

     <select
  value={newEntry.material}
  onChange={(e) =>
    setNewEntry({
      ...newEntry,
      material: e.target.value,
    })
  }
  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
>
        <option value="" disabled>
          Selecione o material
        </option>

        {materials.map((material) => (
          <option key={material.name} value={material.name}>
            {material.name}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="text-sm font-medium text-slate-700">
  {materials.find((material) => material.name === newEntry.material)?.control ===
  'Metragem'
    ? 'Quantidade em metros'
    : materials.find((material) => material.name === newEntry.material)?.control ===
        'Bobina com metragem restante'
      ? 'Quantidade de bobinas fechadas'
      : materials.find((material) => material.name === newEntry.material)?.control ===
          'Pote fechado'
        ? 'Quantidade de potes'
        : materials.find((material) => material.name === newEntry.material)?.control ===
            'Bobina inteira'
          ? 'Quantidade de bobinas'
          : 'Quantidade de unidades'}
</label>

     <input
  type="number"
  step="1"
  value={newEntry.quantity}
  onChange={(e) =>
    setNewEntry({
      ...newEntry,
      quantity: e.target.value,
    })
  }
  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
  placeholder="Digite a quantidade"
/>
    </div>

    <div>
      <label className="text-sm font-medium text-slate-700">
        Data da entrada
      </label>

     <input
  type="date"
  value={newEntry.date}
  onChange={(e) =>
    setNewEntry({
      ...newEntry,
      date: e.target.value,
    })
  }
  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
/>
    </div>

    <div>
      <label className="text-sm font-medium text-slate-700">
        Observação
      </label>

      <textarea
  rows={3}
  value={newEntry.note}
  onChange={(e) =>
    setNewEntry({
      ...newEntry,
      note: e.target.value,
    })
  }
  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
  placeholder="Ex.: Compra de material"
/>
    </div>
  
{entryError && (
  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
    {entryError}
  </div>
)}

    <div className="flex justify-end pt-2">
      <button
 onClick={async () => {
  setEntryError('')

  if (
    !newEntry.material ||
    !newEntry.quantity ||
    !newEntry.date ||
    !newEntry.note.trim()
  ) {
    setEntryError('Preencha todos os campos da entrada.')
return
  }


    const quantity = Number(newEntry.quantity)

  if (quantity <= 0) {
    setEntryError('A quantidade deve ser maior que zero.')
    return
  }

  const material = materials.find(
    (item) => item.name === newEntry.material
  )

  if (!material) {
    alert('Material não encontrado.')
    return
  }


const { data: entryData, error: entryError } = await supabase
  .from('entries')
  .insert({
    material_id: material.id,
    quantity,
    date: newEntry.date,
    note: newEntry.note,
    user_id: user.id,
  })
  .select()
  .single()

if (entryError) {
  console.error('Erro ao registrar entrada:', entryError)
  alert('Erro ao registrar entrada.')
  return
}

  const updatedMaterial =
    material.control === 'Bobina com metragem restante'
      ? {
          closed_rolls: (material.closedRolls || 0) + quantity,
        }
      : {
          quantity: (material.quantity || 0) + quantity,
        }

  const { error: materialError } = await supabase
    .from('materiais')
    .update(updatedMaterial)
    .eq('id', material.id)

  if (materialError) {
    console.error('Erro ao atualizar estoque:', materialError)
    alert('A entrada foi registrada, mas houve erro ao atualizar o estoque.')
    return
  }

  const entry = {
  id: entryData.id,
  material: material.name,
  quantity,
  date: newEntry.date,
  note: newEntry.note,
  createdAt: entryData.created_at,
}

  setEntries([...entries, entry])

  setMaterials(
    materials.map((item) => {
      if (item.id !== material.id) {
        return item
      }

      if (material.control === 'Bobina com metragem restante') {
        return {
          ...item,
          closedRolls: (item.closedRolls || 0) + quantity,
        }
      }

      return {
        ...item,
        quantity: (item.quantity || 0) + quantity,
      }
    })
  )

  setNewEntry({
    material: '',
    quantity: '',
    date: '',
    note: '',
  })
}}
  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
>
  Registrar entrada
</button>
    </div>
  </div>
</div>

 <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-bold text-slate-900">
      Entradas registradas
    </h2>

    {entries.length === 0 ? (
      <p className="mt-4 text-sm text-slate-500">
        Nenhuma entrada registrada ainda.
      </p>
    ) : (
      <div className="mt-4 space-y-3">
        {entries.map((entry, index) => (
          <div
  key={entry.id}
  className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 transition hover:shadow-sm"
>
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <div className="flex items-center gap-2">
        <p className="font-semibold text-slate-900">
          {entry.material}
        </p>

        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
          Entrada
        </span>
      </div>

      <p className="mt-1 text-sm text-slate-500">
        Quantidade: <span className="font-medium text-slate-700">{entry.quantity}</span>
      </p>
    </div>

   <div className="text-left sm:text-right">
  <p className="text-xs text-slate-500">
    Data
  </p>

  <p className="text-sm font-medium text-slate-700">
    {new Date(`${entry.date}T00:00:00`).toLocaleDateString('pt-BR')}
  </p>

  <p className="mt-1 text-xs text-slate-500">
   Adicionado às {entry.createdAt.split(',')[1]?.trim()}
  </p>
</div>
  </div>

  {entry.note && (
    <div className="mt-3 border-t border-emerald-100 pt-3">
      <p className="text-sm text-slate-600">
        <span className="font-medium text-slate-700">Observação:</span>{' '}
        {entry.note}
      </p>
    </div>
  )}
</div>
        ))}
      </div>
    )}
  </div>
        </section>
      )}

      </div>
            
              {page === 'Saídas' && (
  <section className="mx-auto max-w-6xl py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Saídas
          </h1>

          <p className="mt-1 text-slate-500">
            Registre os materiais utilizados no estoque.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <h2 className="text-lg font-bold text-slate-900">
    Registrar saída
  </h2>

  <p className="mt-1 text-sm text-slate-500">
    Informe os dados do material que saiu do estoque.
  </p>

  <div className="mt-6 grid gap-4">
    <div>
      <label className="text-sm font-medium text-slate-700">
        Material
      </label>

      <select
  value={newExit.material}
  onChange={(e) =>
    setNewExit({
      ...newExit,
      material: e.target.value,
    })
  }
  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
>
        <option value="" disabled>
          Selecione o material
        </option>

        {materials.map((material) => (
          <option key={material.name} value={material.name}>
            {material.name}
          </option>
        ))}
      </select>
      {materials.find((material) => material.name === newExit.material)?.control ===
  'Bobina com metragem restante' && (
  <div className="mt-4">
    <label className="block text-sm font-medium text-slate-700">
      Tipo de saída
    </label>

    <select
      value={exitType}
      onChange={(e) =>
        setExitType(e.target.value as 'metros' | 'bobina')
      }
      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
    >
      <option value="metros">Metros</option>
      <option value="bobina">Bobina inteira</option>
    </select>
  </div>
)}
    </div>

    <div>
      <label className="text-sm font-medium text-slate-700">
        Quantidade
      </label>

     <input
  type="number"
  step="1"
  value={newExit.quantity}
  onChange={(e) =>
    setNewExit({
      ...newExit,
      quantity: e.target.value,
    })
  }
  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
  placeholder="Digite a quantidade"
/>
    </div>

    <div>
      <label className="text-sm font-medium text-slate-700">
        Data da saída
      </label>

      <input
  type="date"
  value={newExit.date}
  onChange={(e) =>
    setNewExit({
      ...newExit,
      date: e.target.value,
    })
  }
  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
/>
    </div>

    <div>
      <label className="text-sm font-medium text-slate-700">
        Observação
      </label>

      <textarea
  rows={3}
  value={newExit.note}
  onChange={(e) =>
    setNewExit({
      ...newExit,
      note: e.target.value,
    })
  }
  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
  placeholder="Ex.: Material utilizado em pedido"
/>
    </div>
    {exitError && (
  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
    {exitError}
  </div>
)}

    <div className="flex justify-end pt-2">
     <button
 onClick={async () => {
  setExitError('')

  if (
    !newExit.material ||
    !newExit.quantity ||
    !newExit.date ||
    !newExit.note.trim()
  ) {
    setExitError('Preencha todos os campos da saída.')
    return
  }

  const quantity = Number(newExit.quantity)

  if (quantity <= 0) {
    setExitError('A quantidade deve ser maior que zero.')
    return
  }

  const material = materials.find(
    (item) => item.name === newExit.material
  )

  if (!material) {
    setExitError('Material não encontrado.')
    return
  }

  if (material.control === 'Bobina com metragem restante') {
    if (exitType === 'metros') {
      const totalMeters =
        (material.activeMeters || 0) +
        (material.closedRolls || 0) * 500

      if (quantity > totalMeters) {
        setExitError(
          'A quantidade informada é maior que o estoque disponível.'
        )
        return
      }
    }

    if (exitType === 'bobina') {
      if (quantity > (material.closedRolls || 0)) {
        setExitError(
          'A quantidade de bobinas informada é maior que o estoque disponível.'
        )
        return
      }
    }
  } else if (quantity > (material.quantity || 0)) {
    setExitError('A quantidade informada é maior que o estoque disponível.')
    return
  }

  const { data: exitData, error: exitError } = await supabase
    .from('exits')
    .insert({
      material_id: material.id,
      quantity,
      date: newExit.date,
      note: newExit.note,
      user_id: user.id,
    })
    .select()
    .single()

  if (exitError) {
    console.error('Erro ao registrar saída:', exitError)
    alert('Erro ao registrar saída.')
    return
  }

  let updatedMaterial: {
    active_meters?: number
    closed_rolls?: number
    quantity?: number
  }

  if (material.control === 'Bobina com metragem restante') {
    if (exitType === 'bobina') {
      updatedMaterial = {
        active_meters: material.activeMeters || 0,
        closed_rolls: (material.closedRolls || 0) - quantity,
      }
    } else {
      let remainingQuantity = quantity
      let activeMeters = material.activeMeters || 0
      let closedRolls = material.closedRolls || 0

      if (remainingQuantity <= activeMeters) {
        activeMeters -= remainingQuantity
      } else {
        remainingQuantity -= activeMeters
        activeMeters = 0

        while (remainingQuantity > 0 && closedRolls > 0) {
          closedRolls -= 1

          if (remainingQuantity >= 500) {
            remainingQuantity -= 500
            activeMeters = 0
          } else {
            activeMeters = 500 - remainingQuantity
            remainingQuantity = 0
          }
        }
      }

      updatedMaterial = {
        active_meters: activeMeters,
        closed_rolls: closedRolls,
      }
    }
  } else {
    updatedMaterial = {
      quantity: (material.quantity || 0) - quantity,
    }
  }

  const { error: materialError } = await supabase
    .from('materiais')
    .update(updatedMaterial)
    .eq('id', material.id)

  if (materialError) {
    console.error('Erro ao atualizar estoque:', materialError)
    alert('A saída foi registrada, mas houve erro ao atualizar o estoque.')
    return
  }

  const exit = {
  id: exitData.id,
  material: material.name,
  quantity,
  date: newExit.date,
  note: newExit.note,
  createdAt: exitData.created_at,
}

  setExits([...exits, exit])

  setMaterials(
    materials.map((item) => {
      if (item.id !== material.id) {
        return item
      }

      if (material.control === 'Bobina com metragem restante') {
        return {
          ...item,
          activeMeters: updatedMaterial.active_meters ?? 0,
          closedRolls: updatedMaterial.closed_rolls ?? 0,
        }
      }

      return {
        ...item,
        quantity: (item.quantity || 0) - quantity,
      }
    })
  )

  setNewExit({
    material: '',
    quantity: '',
    date: '',
    note: '',
  })
}}
  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
>
  Registrar saída
</button>
    </div>
  </div>
</div>
<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <h2 className="text-lg font-bold text-slate-900">
    Saídas registradas
  </h2>

  {exits.length === 0 ? (
    <p className="mt-4 text-sm text-slate-500">
      Nenhuma saída registrada ainda.
    </p>
  ) : (
    <div className="mt-4 space-y-3">
      {exits.map((exit, index) => (
        <div
          key={exit.id}
          className="rounded-xl border border-red-100 bg-red-50/30 p-4 transition hover:shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">
                  {exit.material}
                </p>

                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                  Saída
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Quantidade:{' '}
                <span className="font-medium text-slate-700">
                  {exit.quantity}
                </span>
              </p>
            </div>

            <div className="text-left sm:text-right">
  <p className="text-xs text-slate-500">
    Data
  </p>

  <p className="text-sm font-medium text-slate-700">
    {new Date(`${exit.date}T00:00:00`).toLocaleDateString('pt-BR')}
  </p>

  <p className="mt-1 text-xs text-slate-500">
    Adicionado às{' '}
    {new Date(exit.createdAt).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}
  </p>
</div>
          </div>

          {exit.note && (
            <div className="mt-3 border-t border-red-100 pt-3">
              <p className="text-sm text-slate-600">
                <span className="font-medium text-slate-700">
                  Observação:
                </span>{' '}
                {exit.note}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</div>
      </section>
    )}

      {materialToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900">
              Excluir material?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tem certeza que deseja excluir o material{' '}
              <span className="font-semibold text-slate-900">
                {materialToDelete.name}
              </span>
              ? Essa ação não poderá ser desfeita.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setMaterialToDelete(null)
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                onClick={async () => {
  if (!materialToDelete) return

  const { error } = await supabase
    .from('materiais')
    .delete()
    .eq('id', materialToDelete.id)

  if (error) {
    console.error('Erro ao excluir material:', error)
    alert('Erro ao excluir material.')
    return
  }

  setMaterials(
    materials.filter((item) => item.id !== materialToDelete.id)
  )

  setMaterialToDelete(null)
}}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Confirmar exclusão
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
   
  )
}

export default App