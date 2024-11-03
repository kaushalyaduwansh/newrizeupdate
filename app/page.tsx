import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pen, PenTool, FileSignature, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      title: "Resize Your Signature",
      description: "Upload or draw your signature and customize its size and background",
      icon: Pen,
      href: "/resize-signature",
    },
    {
      title: "Create Signature",
      description: "Draw your signature with custom background and multiple download formats",
      icon: PenTool,
      href: "/create-signature",
    },
    {
      title: "SSC Exam Signature",
      description: "Prepare your signature specifically for SSC examinations",
      icon: GraduationCap,
      href: "/ssc-signature",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Professional Signature Management
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create, resize, and manage your signatures with our easy-to-use tools. Perfect for
          documents, forms, and official use.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={feature.href}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-8">
          <div className="p-6 rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
            <p className="text-muted-foreground">
              Intuitive interface for quick signature creation and management
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">Multiple Formats</h3>
            <p className="text-muted-foreground">
              Download your signatures in PNG, JPG, or JPEG formats
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">Customizable</h3>
            <p className="text-muted-foreground">
              Adjust size, background, and other properties to match your needs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}