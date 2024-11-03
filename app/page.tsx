"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import SignatureCanvas from "@/components/signature-canvas";
import { toast } from "sonner";
import { Settings2, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PresetColor {
  name: string;
  value: string;
}

interface ColorButtonProps {
  color: PresetColor;
  isSelected: boolean;
  onClick: (value: string) => void;
}

const PRESET_COLORS: PresetColor[] = [
  { name: "White", value: "#FFFFFF" },
  { name: "Light Gray", value: "#F5F5F5" },
  { name: "Cream", value: "#FFEFD5" },
  
];

export default function ResizeSignature(): JSX.Element {
  const [withBackground, setWithBackground] = useState<boolean>(false);
  const [bgColor, setBgColor] = useState<string>("#FFFFFF");
  const [width, setWidth] = useState<number>(350);
  const [height, setHeight] = useState<number>(150);
  const [maxSize, setMaxSize] = useState<number>(45);
  const [downloadFormat, setDownloadFormat] = useState<string>("PNG");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && withBackground) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(currentImageData, 0, 0);
      }
    }
  }, [bgColor, withBackground]);

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 50 && value <= 1000) {
      setWidth(value);
    }
  };

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 50 && value <= 1000) {
      setHeight(value);
    }
  };

  const handleMaxSizeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 10 && value <= 500) {
      setMaxSize(value);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.onload = () => {
        setPreviewImage(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const canvas = canvasRef.current;
      if (!canvas) {
        toast.error("No signature to download");
        return;
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const ctx = tempCanvas.getContext('2d');
      
      if (!ctx) {
        toast.error("Could not process signature");
        return;
      }

      if (withBackground) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }

      if (previewImage) {
        const img = new Image();
        img.src = previewImage;
        ctx.drawImage(img, 0, 0, width, height);
      } else {
        ctx.drawImage(canvas, 0, 0, width, height);
      }

      const blob = await new Promise<Blob>((resolve) => {
        tempCanvas.toBlob(
          (blob) => resolve(blob!),
          `image/${downloadFormat.toLowerCase()}`,
          0.8
        );
      });

      if (blob.size > maxSize * 1024) {
        toast.error(`File size exceeds ${maxSize}KB limit`);
        return;
      }

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

  const ColorButton = ({ color, isSelected, onClick }: ColorButtonProps): JSX.Element => (
    <Button
      variant="outline"
      className={cn(
        "w-9 h-9 p-0 rounded-md relative hover:opacity-90 transition-opacity",
        isSelected && "ring-1 ring-primary ring-offset-0"
      )}
      style={{ backgroundColor: color.value }}
      onClick={() => onClick(color.value)}
    >
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Check className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs opacity-0 group-hover:opacity-100">
        
      </div>
    </Button>
  );

  const ColorSelector = (): JSX.Element => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {PRESET_COLORS.map((color) => (
          <div key={color.value} className="group relative">
            <ColorButton
              color={color}
              isSelected={bgColor === color.value}
              onClick={setBgColor}
            />
          </div>
        ))}
        <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: bgColor }}
            />
            Custom Color
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60">
          <div className="space-y-2">
            
            <Input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-8"
            />
          </div>
        </PopoverContent>
      </Popover>
      </div>
      
    </div>
  );

  const CustomizationPanel = (): JSX.Element => (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="background"
              checked={withBackground}
              onCheckedChange={setWithBackground}
            />
            <Label htmlFor="background">Background Color</Label>
          </div>
          {withBackground && <ColorSelector />}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Dimensions</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="width">Width</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="width"
                type="number"
                min={50}
                max={1000}
                value={width}
                onChange={handleWidthChange}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">px</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="height"
                type="number"
                min={50}
                max={1000}
                value={height}
                onChange={handleHeightChange}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">px</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxSize">Max File Size</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="maxSize"
            type="number"
            min={10}
            max={500}
            value={maxSize}
            onChange={handleMaxSizeChange}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">KB</span>
        </div>
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

  const SignaturePreview = (): JSX.Element => (
    <div 
      className="rounded-lg border overflow-hidden"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: withBackground ? bgColor : 'transparent'
      }}
    >
      {previewImage && (
        <img
          src={previewImage}
          alt="Signature Preview"
          className="object-contain w-full h-full"
        />
      )}
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
                  <SignaturePreview />
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
                <div 
                  className="rounded-lg border overflow-hidden"
                  style={{ backgroundColor: withBackground ? bgColor : 'transparent' }}
                >
                  <SignatureCanvas
                    width={width}
                    height={height}
                    ref={canvasRef}
                  />
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
