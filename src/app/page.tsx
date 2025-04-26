'use client';

import type { ChangeEvent } from 'react';
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, BookOpen, Languages, Smile } from 'lucide-react';
import Image from 'next/image';
import { generatePoem } from '@/ai/flows/generate-poem';
import { useToast } from '@/hooks/use-toast';

// Define available tones and languages
const poemTones = ['Let AI Decide', 'Reflective', 'Happy', 'Sad', 'Romantic', 'Humorous', 'Mysterious', 'Hopeful', 'Nostalgic'];
const poemLanguages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Italian', 'Portuguese', 'Russian'];

export default function Home() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const [poemTitle, setPoemTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string | undefined>(poemTones[0]); // Default to 'Let AI Decide'
  const [selectedLanguage, setSelectedLanguage] = useState<string>(poemLanguages[0]); // Default to English
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
       // Basic validation for file size (e.g., 5MB)
       if (file.size > 5 * 1024 * 1024) {
         toast({
           title: 'File Too Large',
           description: 'Please upload an image smaller than 5MB.',
           variant: 'destructive',
         });
         return;
       }
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
      // Pass the tone only if it's not 'Let AI Decide'
      const toneToPass = selectedTone === 'Let AI Decide' ? undefined : selectedTone;
      const result = await generatePoem({
        photoDataUri: photoPreview,
        tone: toneToPass,
        language: selectedLanguage,
       });
      setPoemTitle(result.title);
      setPoem(result.poem);
    } catch (error) {
      console.error('Error generating poem:', error);
       toast({
        title: "Poem Generation Failed",
        description: `Could not generate a poem. ${error instanceof Error ? error.message : 'Please try again.'}`,
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
        <CardHeader className="text-center border-b pb-4">
          <CardTitle className="text-3xl md:text-4xl font-serif font-bold text-primary flex items-center justify-center gap-2">
             <BookOpen className="h-8 w-8" /> Photo Poet
          </CardTitle>
           <p className="text-muted-foreground text-sm md:text-base mt-1">Turn your photos into poetry</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          {/* Controls and Photo Upload Section */}
          <div className="flex flex-col space-y-6">
             {/* Upload Area */}
            <div className="space-y-2">
              <Label htmlFor="photo-upload" className="text-lg font-semibold text-secondary-foreground flex items-center gap-2">
                <Upload className="h-5 w-5" /> Upload Your Inspiration
              </Label>
              <div
                className="w-full h-48 md:h-64 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted cursor-pointer hover:border-primary transition-colors relative overflow-hidden"
                onClick={triggerFileInput}
                role="button"
                aria-label="Upload photo"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerFileInput()}
              >
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Uploaded photo preview"
                    fill // Use fill for responsive background-like image
                    className="object-contain rounded-md p-1" // object-contain to keep aspect ratio
                  />
                ) : (
                  <div className="text-center text-muted-foreground p-4">
                    <Upload className="mx-auto h-10 w-10 mb-2" />
                    <p>Click or tap to upload</p>
                    <p className="text-xs">(Max 5MB)</p>
                  </div>
                )}
              </div>
              <Input
                id="photo-upload"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg, image/png, image/webp, image/gif" // Specify accepted types
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Tone Selection */}
            <div className="space-y-2">
              <Label htmlFor="tone-select" className="font-semibold text-secondary-foreground flex items-center gap-2">
                <Smile className="h-5 w-5" /> Select Tone (Optional)
              </Label>
              <Select value={selectedTone} onValueChange={setSelectedTone}>
                <SelectTrigger id="tone-select" className="w-full" aria-label="Select poem tone">
                  <SelectValue placeholder="Choose a tone..." />
                </SelectTrigger>
                <SelectContent>
                  {poemTones.map((tone) => (
                    <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

             {/* Language Selection */}
             <div className="space-y-2">
               <Label htmlFor="language-select" className="font-semibold text-secondary-foreground flex items-center gap-2">
                 <Languages className="h-5 w-5" /> Select Language
               </Label>
               <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                 <SelectTrigger id="language-select" className="w-full" aria-label="Select poem language">
                   <SelectValue placeholder="Choose a language..." />
                 </SelectTrigger>
                 <SelectContent>
                   {poemLanguages.map((lang) => (
                     <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

             {/* Generate Button */}
              <Button
                onClick={handleGeneratePoem}
                disabled={!photo || isLoading}
                className="w-full mt-4 text-lg py-3"
                size="lg"
               >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-5 w-5" />
                    Generate Poem
                  </>
                )}
              </Button>
          </div>

          {/* Poem Display Section */}
          <div className="flex flex-col space-y-2">
             <Label htmlFor="poem-output" className="text-lg font-semibold text-secondary-foreground mb-2">
              Your Poem
            </Label>
            <Card
              id="poem-output"
              className={`w-full h-auto min-h-[20rem] md:min-h-[28rem] p-4 bg-muted overflow-y-auto transition-opacity duration-500 ease-in-out flex flex-col items-center justify-center shadow-inner ${poem || isLoading ? 'opacity-100' : 'opacity-60'}`}
              aria-live="polite"
             >
               {isLoading ? (
                 <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Crafting your verse...</p>
                 </div>
               ) : poem ? (
                 <div className="text-left w-full fade-in">
                    {poemTitle && <h3 className="text-xl font-serif font-bold mb-3 text-primary border-b pb-1">{poemTitle}</h3>}
                   <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">{poem}</pre>
                  </div>
               ) : (
                 <p className="text-muted-foreground text-center italic">Upload a photo and click "Generate Poem" to see the magic happen here.</p>
               )}
             </Card>
          </div>
        </CardContent>
      </Card>
       <style jsx>{`
        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
