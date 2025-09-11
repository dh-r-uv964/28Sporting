import React, { useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { SPORTS, PRICE_RANGES, AMENITIES, formatSportName } from '@/components/common/constants';

const VenueFilters = memo(({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    sport: 'all',
    price: 'all',
    rating: [0],
    amenities: [],
  });

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleAmenity = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    updateFilter('amenities', newAmenities);
  };

  const clearFilters = () => {
    const clearedFilters = {
      sport: 'all',
      price: 'all',
      rating: [0],
      amenities: [],
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Filters</CardTitle>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sport Filter */}
        <div className="space-y-2">
          <Label>Sport</Label>
          <Select value={filters.sport} onValueChange={(value) => updateFilter('sport', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              {SPORTS.map(sport => (
                <SelectItem key={sport} value={sport}>
                  {formatSportName(sport)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Filter */}
        <div className="space-y-2">
          <Label>Price Range</Label>
          <Select value={filters.price} onValueChange={(value) => updateFilter('price', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              {PRICE_RANGES.map(price => (
                <SelectItem key={price} value={price}>
                  {price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <Label>Minimum Rating</Label>
          <div className="px-2">
            <Slider
              value={filters.rating}
              onValueChange={(value) => updateFilter('rating', value)}
              max={5}
              min={0}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Any</span>
              <span>{filters.rating[0]} stars</span>
            </div>
          </div>
        </div>

        {/* Amenities Filter */}
        <div className="space-y-3">
          <Label>Amenities</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {AMENITIES.map(amenity => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={filters.amenities.includes(amenity)}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <Label htmlFor={`amenity-${amenity}`} className="text-sm">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default VenueFilters;