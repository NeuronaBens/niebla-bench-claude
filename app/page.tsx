import { DiasFestival } from '@/components/portada/DiasFestival'
import { HeroNiebla } from '@/components/portada/HeroNiebla'
import { InfoEntradas } from '@/components/portada/InfoEntradas'
import { MapaSalas } from '@/components/portada/MapaSalas'
import { QueEs } from '@/components/portada/QueEs'
import { SeccionesFestival } from '@/components/portada/SeccionesFestival'

export default function Portada() {
  return (
    <>
      <HeroNiebla />
      <QueEs />
      <DiasFestival />
      <SeccionesFestival />
      <MapaSalas />
      <InfoEntradas />
    </>
  )
}
