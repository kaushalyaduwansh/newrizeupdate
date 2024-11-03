"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import SignatureCanvas from "@/components/signature-canvas";
import { toast } from "sonner";
import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResizeSignature() {
  const [withBackground, setWithBackground] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(150);
  const [maxSize, setMaxSize] = useState(500);
  const [downloadFormat, setDownloadFormat] = useState("PNG");
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setPreviewImage(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      
      // Get the canvas element
      const canvas = canvasRef.current;
      if (!canvas) {
        toast.error("No signature to download");
        return;
      }

      // Create a temporary canvas with the desired dimensions
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const ctx = tempCanvas.getContext('2d');
      
      if (!ctx) {
        toast.error("Could not process signature");
        return;
      }

      // Fill background if enabled
      if (withBackground) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw the signature
      if (previewImage) {
        const img = new Image();
        img.src = previewImage;
        ctx.drawImage(img, 0, 0, width, height);
      } else {
        ctx.drawImage(canvas, 0, 0, width, height);
      }

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        tempCanvas.toBlob(
          (blob) => resolve(blob!),
          `image/${downloadFormat.toLowerCase()}`,
          0.8
        );
      });

      // Check file size
      if (blob.size > maxSize * 1024) {
        toast.error(`File size exceeds ${maxSize}KB limit`);
        return;
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signature.${downloadFormat.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Signature downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download signature");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomizationPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="background"
          checked={withBackground}
          onCheckedChange={setWithBackground}
        />
        <Label htmlFor="background">Include Background</Label>
      </div>

      {withBackground && (
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="bgColor">Background Color</Label>
          <Input
            id="bgColor"
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-4">
        <Label>Dimensions (px)</Label>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="width">Width: {width}px</Label>
            <Slider
              id="width"
              min={50}
              max={1000}
              step={1}
              value={[width]}
              onValueChange={([value]) => setWidth(value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height: {height}px</Label>
            <Slider
              id="height"
              min={50}
              max={1000}
              step={1}
              value={[height]}
              onValueChange={([value]) => setHeight(value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxSize">Max File Size (KB): {maxSize}KB</Label>
        <Slider
          id="maxSize"
          min={100}
          max={2000}
          step={100}
          value={[maxSize]}
          onValueChange={([value]) => setMaxSize(value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Download Format</Label>
        <div className="flex flex-wrap gap-2">
          {["PNG", "JPG", "JPEG"].map((format) => (
            <Button
              key={format}
              variant={downloadFormat === format ? "default" : "outline"}
              onClick={() => setDownloadFormat(format)}
              className="flex-1"
            >
              {format}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Resize Your Signature</h1>
      
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Signature</TabsTrigger>
            <TabsTrigger value="draw">Draw Signature</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <Label htmlFor="signature">Upload Signature</Label>
                  <Input
                    id="signature"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mb-4"
                  />
                  {previewImage && (
                    <div className="relative aspect-video">
                      <img
                        src={previewImage}
                        alt="Signature Preview"
                        className="rounded-lg border object-contain w-full h-full"
                        style={{ width, height }}
                      />
                    </div>
                  )}
                </div>
              </Card>

              <div className="hidden md:block">
                <Card className="p-6">
                  <CustomizationPanel />
                </Card>
              </div>

              <div className="md:hidden">
                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                  <DrawerTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Settings2 className="mr-2 h-4 w-4" />
                      Customize Signature
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Customize Signature</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4">
                      <CustomizationPanel />
                      <Button
                        className="w-full mt-4"
                        onClick={() => setDrawerOpen(false)}
                      >
                        Save Settings
                      </Button>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="draw">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <SignatureCanvas
                  width={width}
                  height={height}
                  ref={canvasRef}
                />
              </Card>

              <div className="hidden md:block">
                <Card className="p-6">
                  <CustomizationPanel />
                </Card>
              </div>

              <div className="md:hidden">
                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                  <DrawerTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Settings2 className="mr-2 h-4 w-4" />
                      Customize Signature
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Customize Signature</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4">
                      <CustomizationPanel />
                      <Button
                        className="w-full mt-4"
                        onClick={() => setDrawerOpen(false)}
                      >
                        Save Settings
                      </Button>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <Button
            className={cn("w-full", isLoading && "opacity-50 cursor-not-allowed")}
            onClick={handleDownload}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Download Signature"}
          </Button>
        </div>
      </div>
    </div>
  );
}