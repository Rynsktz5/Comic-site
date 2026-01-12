"use client"

import { useRouter } from "next/navigation"
import CardNav from "../../components/CardNav"
const logo = "/logo.svg"


export default function CardNavMenu() {
  const router = useRouter()

  const items = [
    {
      label: "Library",
      bgColor: "#050505",
      textColor: "#ffffff",
      links: [
        {
          label: "All Comics",
          ariaLabel: "Browse all comics",
          onClick: () => router.push("/")
        },
        {
          label: "Favourites",
          ariaLabel: "Favourite comics",
          onClick: () => router.push("/favourites")
        }
      ]
    },
    {
      label: "Reader",
      bgColor: "#0B1020",
      textColor: "#ffffff",
      links: [
        {
          label: "Continue Reading",
          ariaLabel: "Continue reading",
          onClick: () => {
  const raw = localStorage.getItem("continue_reading")

  if (!raw) {
    alert("No reading progress found")
    return
  }

  try {
    const data = JSON.parse(raw)

    if (!data.chapterId) {
      alert("Invalid reading progress")
      return
    }

    router.push(`/reader/${data.chapterId}`)
  } catch {
    alert("Corrupted reading data")
  }
}

        }
      ]
    },
    {
      label: "About",
      bgColor: "#120A1F",
      textColor: "#ffffff",
      links: [
        {
          label: "About Project",
          ariaLabel: "About Manga Reader",
          onClick: () => router.push("/about")
        },
       
      ]
    },
    {
      label: "Socials",
      bgColor: "#1A0F2E",
      textColor: "#ffffff",
      links: [
        {
          label: "Instagram",
          ariaLabel: "Instagram",
          onClick: () =>
            window.open("https://instagram.com", "_blank")
        },
        
      ]
    }
  ]

  return (
   <CardNav
  logo={logo}
  logoAlt="Manga Reader"
  items={items}
  baseColor="#fff"
  menuColor="#000"
  buttonBgColor="#111"
  buttonTextColor="#fff"
  ease="power3.out"
/>

    
  )
}
