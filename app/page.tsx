import { EscenaFaro } from '@/components/portada/EscenaFaro.tsx'
import { QueEs } from '@/components/portada/QueEs.tsx'
import { SeccionesPortada } from '@/components/portada/SeccionesPortada.tsx'
import { TresDias } from '@/components/portada/TresDias.tsx'
import { Salas } from '@/components/portada/Salas.tsx'
import { Entradas } from '@/components/portada/Entradas.tsx'
import { Destacados } from '@/components/portada/Destacados.tsx'

export default function Portada() {
  return (
    <div>
      <EscenaFaro />
      <QueEs />
      <SeccionesPortada />
      <TresDias />
      <Salas />
      <Entradas />
      <Destacados />
    </div>
  )
}
