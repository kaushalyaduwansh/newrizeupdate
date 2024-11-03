"use client";

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Pen, PenTool, FileSignature, GraduationCap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  
  const navigation = [
    { name: "Home", href: "/", icon: FileSignature },
    { name: "Resize Signature", href: "/resize-signature", icon: Pen },
    { name: "Create Signature", href: "/create-signature", icon: PenTool },
    { name: "SSC Exam Signature", href: "/ssc-signature", icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 items-center">
        <NavigationMenu>
          <NavigationMenuList className="flex gap-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                        pathname === item.href && "bg-accent/50"
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
    </header>
  );
}

export default Navbar;