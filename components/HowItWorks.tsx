const STEPS = [
  {
    emoji: '🎯',
    bg: 'bg-violet/15',
    title: 'Escolha o que quer fazer',
    text: 'Selecione seu foco do dia em 1 clique.',
  },
  {
    emoji: '⚡',
    bg: 'bg-pink/15',
    title: 'Entre na sala de 15 min',
    text: 'Conexão instantânea de áudio ou chat com 1 pessoa.',
  },
  {
    emoji: '🚀',
    bg: 'bg-emerald/15',
    title: 'Criem ou joguem juntos',
    text: 'Façam a conexão valer a pena.',
  },
]

export default function HowItWorks() {
  return (
    <section className="relative z-10 max-w-5xl mx-auto px-6 py-14 border-t border-white/5">
      <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white text-center mb-10">
        Como funciona?
      </h2>

      <div className="grid sm:grid-cols-3 gap-6">
        {STEPS.map((step) => (
          <div key={step.title} className="text-center">
            <div className={`w-12 h-12 mx-auto rounded-2xl ${step.bg} flex items-center justify-center text-xl mb-3`}>
              {step.emoji}
            </div>
            <h3 className="font-display font-bold text-white mb-1">{step.title}</h3>
            <p className="text-sm text-zinc-500">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
