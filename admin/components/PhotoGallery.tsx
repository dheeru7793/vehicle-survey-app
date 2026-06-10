'use client';

import {
  Box,
  Dialog,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useState } from 'react';

type Photo = {
  _id: string;
  sequenceNo: number;
  url: string;
  thumbUrl: string;
  sizeBytes: number;
};

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  if (photos.length === 0) {
    return <Box sx={{ color: 'text.secondary' }}>No photos uploaded yet.</Box>;
  }

  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  return (
    <>
      <ImageList cols={6} gap={6} variant="quilted">
        {photos.map((p, i) => (
          <ImageListItem
            key={p._id}
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              setIdx(i);
              setOpen(true);
            }}
          >
            {/* Signed S3 URL — direct <img> avoids next/image domain config */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.thumbUrl || p.url}
              alt={`#${p.sequenceNo}`}
              loading="lazy"
              style={{ objectFit: 'cover', width: '100%', height: 140 }}
            />
            <ImageListItemBar
              title={`#${p.sequenceNo}`}
              subtitle={`${(p.sizeBytes / 1024).toFixed(0)} KB`}
              sx={{ '& .MuiImageListItemBar-title': { fontSize: 12 } }}
            />
          </ImageListItem>
        ))}
      </ImageList>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <Box sx={{ position: 'relative', bgcolor: 'black' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[idx].url}
            alt={`#${photos[idx].sequenceNo}`}
            style={{ display: 'block', maxHeight: '85vh', width: '100%', objectFit: 'contain' }}
          />
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', px: 1 }}
          >
            <IconButton onClick={prev} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.4)' }}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={next} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.4)' }}>
              <ChevronRightIcon />
            </IconButton>
          </Stack>
        </Box>
      </Dialog>
    </>
  );
}
