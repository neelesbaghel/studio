'use client';

import type { ChangeEvent } from 'react';
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { generatePoem } from '@/ai/flows/generate-poem';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const [poemTitle, setPoemTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPoem(null); // Reset poem when new photo is uploaded
      setPoemTitle(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGeneratePoem = async () => {
    if (!photo || !photoPreview) {
       toast({
        title: "No Photo Selected",
        description: "Please upload a photo first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPoem(null);
    setPoemTitle(null);

    try {
      const result = await generatePoem({ photoDataUri: photoPreview });
      setPoemTitle(result.title);
      setPoem(result.poem);
    } catch (error) {
      console.error('Error generating poem:', error);
       toast({
        title: "Poem Generation Failed",
        description: "Could not generate a poem. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12 bg-background">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-serif font-bold text-primary">
            Photo Poet
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Photo Upload Section */}
          <div className="flex flex-col items-center space-y-4">
             <Label htmlFor="photo-upload" className="text-lg font-semibold text-secondary-foreground mb-2">
              Upload Your Inspiration
            </Label>
            <div
              className="w-full h-64 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted cursor-pointer hover:border-primary transition-colors"
              onClick={triggerFileInput}
              role="button"
              aria-label="Upload photo"
            >
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="Uploaded photo preview"
                  width={300}
                  height={256} // Adjust height as needed
                  className="object-contain max-h-full max-w-full rounded-md"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Upload className="mx-auto h-12 w-12 mb-2" />
                  <p>Click or tap to upload a photo</p>
                  <p className="text-xs">(Max 5MB)</p>
                </div>
              )}
            </div>
            <Input
              id="photo-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden" // Hide the default input
            />
             <Button onClick={handleGeneratePoem} disabled={!photo || isLoading} className="w-full mt-4">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Generate Poem
                </>
              )}
            </Button>
          </div>

          {/* Poem Display Section */}
          <div className="flex flex-col space-y-4">
             <Label htmlFor="poem-output" className="text-lg font-semibold text-secondary-foreground mb-2">
              Your Poem
            </Label>
            <div className={`w-full h-64 p-4 border border-border rounded-lg bg-muted overflow-y-auto transition-opacity duration-500 ease-in-out ${poem ? 'opacity-100' : 'opacity-50'} flex items-center justify-center`}>
               {isLoading ? (
                 <Loader2 className="h-12 w-12 animate-spin text-primary" />
               ) : poem ? (
                 <div className="text-left w-full">
                    {poemTitle && <h3 className="text-xl font-serif font-bold mb-2 text-primary">{poemTitle}</h3>}
                   <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">{poem}</pre>
                  </div>
               ) : (
                 <p className="text-muted-foreground text-center">Your generated poem will appear here.</p>
               )}
             </div>

          </div>
        </CardContent>
      </Card>
    </main>
  );
}
