"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeGoogleMapsUrl } from "@/features/school-profile/google-maps-url";
import type { SchoolProfileFieldName } from "@/features/school-profile/types";

type SchoolProfileLocationFieldsProps = {
  values: {
    mapEmbedUrl: string | null;
    latitude: string | null;
    longitude: string | null;
  };
  errors?: Partial<Record<SchoolProfileFieldName, string[]>>;
  disabled?: boolean;
};

function LocationError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function SchoolProfileLocationFields({
  values,
  errors,
  disabled = false,
}: SchoolProfileLocationFieldsProps) {
  const [mapUrl, setMapUrl] = useState(values.mapEmbedUrl ?? "");

  const validMapUrl = normalizeGoogleMapsUrl(mapUrl);

  return (
    <div className="grid gap-5">
      <div className="space-y-2">
        <Label htmlFor="mapEmbedUrl">URL lokasi Google Maps</Label>

        <Input
          id="mapEmbedUrl"
          name="mapEmbedUrl"
          type="text"
          value={mapUrl}
          onChange={(event) => {
            setMapUrl(event.target.value);
          }}
          placeholder="https://www.google.com/maps/..."
          maxLength={4000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.mapEmbedUrl?.length)}
          aria-describedby={
            errors?.mapEmbedUrl?.length
              ? "mapEmbedUrl-error"
              : "mapEmbedUrl-help"
          }
        />

        <p
          id="mapEmbedUrl-help"
          className="text-xs leading-5 text-muted-foreground"
        >
          Tempel tautan Google Maps biasa, URL embed, atau seluruh kode iframe.
          Untuk tautan pendek maps.app.goo.gl, isi juga latitude dan longitude
          agar titik lokasi dapat ditampilkan dengan tepat.
        </p>

        <LocationError
          id="mapEmbedUrl-error"
          message={errors?.mapEmbedUrl?.[0]}
        />

        {validMapUrl && !disabled ? (
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={validMapUrl} target="_blank" rel="noopener noreferrer">
              <MapPin className="size-4" />
              Periksa lokasi
              <ExternalLink className="size-4" />
            </a>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude titik sekolah</Label>

          <Input
            id="latitude"
            name="latitude"
            type="number"
            inputMode="decimal"
            step="any"
            min={-90}
            max={90}
            defaultValue={values.latitude ?? ""}
            placeholder="-7.1234567"
            disabled={disabled}
            aria-invalid={Boolean(errors?.latitude?.length)}
            aria-describedby={
              errors?.latitude?.length ? "latitude-error" : "latitude-help"
            }
          />

          <p id="latitude-help" className="text-xs text-muted-foreground">
            Isi koordinat titik sekolah agar pin Google Maps tampil tepat. Nilai
            harus berada antara -90 sampai 90.
          </p>

          <LocationError id="latitude-error" message={errors?.latitude?.[0]} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude titik sekolah</Label>

          <Input
            id="longitude"
            name="longitude"
            type="number"
            inputMode="decimal"
            step="any"
            min={-180}
            max={180}
            defaultValue={values.longitude ?? ""}
            placeholder="110.1234567"
            disabled={disabled}
            aria-invalid={Boolean(errors?.longitude?.length)}
            aria-describedby={
              errors?.longitude?.length ? "longitude-error" : "longitude-help"
            }
          />

          <p id="longitude-help" className="text-xs text-muted-foreground">
            Isi koordinat titik sekolah agar pin Google Maps tampil tepat. Nilai
            harus berada antara -180 sampai 180.
          </p>

          <LocationError
            id="longitude-error"
            message={errors?.longitude?.[0]}
          />
        </div>
      </div>
    </div>
  );
}
