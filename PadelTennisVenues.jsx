import React from 'react';
import VenueList from '@/components/venues/VenueList';
import { Shield } from 'lucide-react';

export default function PadelTennisVenues() {
  return (
    <VenueList 
      sport="padel_tennis" 
      pageTitle="Padel Tennis Courts"
      pageIcon={Shield}
      pageSubtitle="Find top-rated padel tennis courts and clubs near you."
    />
  );
}