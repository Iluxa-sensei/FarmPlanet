import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sprout,
  Droplets,
  MapPin,
  Calendar,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Leaf
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Types for farm data
interface Field {
  id: string;
  name: string;
  area: number; // in hectares
  crop: string;
  plantingDate: string;
  expectedHarvest: string;
  irrigationSchedule: string;
  status: 'active' | 'preparing' | 'harvested';
}

interface FarmData {
  farmName: string;
  location: string;
  totalArea: number; в
  fields: Field[];
}

// Territory interface from MapPage
interface Territory {
  id: string;
  points: [number, number][];
  name: string;
  crop?: string;
  plantingDate?: string;
  area?: number;
  aiPlan?: any;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const TERRITORIES_STORAGE_KEY = 'farmplanet_territories';

  // Load territories from localStorage (same as MapPage)
  const loadTerritories = (): Territory[] => {
    try {
      const stored = localStorage.getItem(TERRITORIES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading territories:', error);
    }
    return [];
  };

  // Convert territories to fields format
  const convertTerritoriesToFields = (territories: Territory[]): Field[] => {
    return territories.map(territory => {
      // Calculate expected harvest (3 months from planting)
      let expectedHarvest = "";
      if (territory.plantingDate) {
        const plantDate = new Date(territory.plantingDate);
        const harvestDate = new Date(plantDate);
        harvestDate.setMonth(harvestDate.getMonth() + 3);
        expectedHarvest = harvestDate.toISOString().split('T')[0];
      }

      return {
        id: territory.id,
        name: territory.name,
        area: territory.area || 0,
        crop: territory.crop || "Not planted",
        plantingDate: territory.plantingDate || "",
        expectedHarvest: expectedHarvest,
        irrigationSchedule: territory.plantingDate ? "Twice weekly" : "As needed",
        status: territory.plantingDate && territory.crop ? 'active' : 'preparing'
      };
    });
  };

  // Load real data from map territories
  const [territories, setTerritories] = useState<Territory[]>([]);

  useEffect(() => {
    const loadedTerritories = loadTerritories();
    setTerritories(loadedTerritories);
  }, []);

  // Real farm data from territories
  const farmData: FarmData = useMemo(() => {
    const fields = convertTerritoriesToFields(territories);
    const totalArea = fields.reduce((sum, field) => sum + field.area, 0);

    return {
      farmName: "Green Valley Farm",
      location: "From Map",
      totalArea: totalArea,
      fields: fields
    };
  }, [territories]);

  const [newField, setNewField] = useState<Partial<Field>>({
    name: "",
    area: 0,
    crop: "",
    plantingDate: "",
    expectedHarvest: "",
    irrigationSchedule: "Twice weekly",
    status: "preparing"
  });

  const handleAddField = () => {
    toast({
      title: "Use Map to Add Fields",
      description: "Please use the Map page to draw and add new territories",
      variant: "default"
    });
    navigate('/map');
  };

  const handleDeleteField = (id: string) => {
    const updatedTerritories = territories.filter(t => t.id !== id);
    localStorage.setItem(TERRITORIES_STORAGE_KEY, JSON.stringify(updatedTerritories));
    setTerritories(updatedTerritories);

    toast({
      title: "Territory Deleted",
      description: "Territory has been removed from your farm"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'preparing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'harvested':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const activeFields = farmData.fields.filter(f => f.status === 'active').length;
  const activeCrops = new Set(
    farmData.fields
      .filter(f => f.status === 'active' && f.crop && f.crop !== 'Not planted')
      .map(f => f.crop.replace(/^[^\s]+\s/, '')) // Remove emoji from crop name
  ).size;

  // Calculate irrigation status
  const irrigationStatus = useMemo(() => {
    const activeFieldsWithIrrigation = farmData.fields.filter(
      f => f.status === 'active' && f.irrigationSchedule !== 'As needed'
    ).length;

    if (activeFieldsWithIrrigation === 0 && farmData.fields.length === 0) {
      return { status: 'No fields', color: 'text-gray-400' };
    }
    if (activeFieldsWithIrrigation === 0) {
      return { status: 'Not Required', color: 'text-yellow-400' };
    }
    return { status: 'Active', color: 'text-green-400' };
  }, [farmData.fields]);

  return (
    <div className="p-3 sm:p-6 space-y-3 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Farm Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your farm, fields, and crops
          </p>
        </div>
        <Button className="glow-button" onClick={() => navigate('/map')}>
          <MapPin className="w-4 h-4 mr-2" />
          Draw Territory on Map
        </Button>
        <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
          <DialogContent className="sm:max-w-[500px] glass-card">
            <DialogHeader>
              <DialogTitle>Add New Field</DialogTitle>
              <DialogDescription>
                Enter the details of your new field
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Field Name</Label>
                <Input
                  id="name"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  placeholder="e.g., North Field"
                  className="glass-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="area">Area (hectares)</Label>
                <Input
                  id="area"
                  type="number"
                  value={newField.area || ''}
                  onChange={(e) => setNewField({ ...newField, area: parseFloat(e.target.value) })}
                  placeholder="25.5"
                  className="glass-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="crop">Crop Type</Label>
                <Select
                  value={newField.crop}
                  onValueChange={(value) => setNewField({ ...newField, crop: value })}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wheat">Wheat</SelectItem>
                    <SelectItem value="Corn">Corn</SelectItem>
                    <SelectItem value="Soybeans">Soybeans</SelectItem>
                    <SelectItem value="Rice">Rice</SelectItem>
                    <SelectItem value="Cotton">Cotton</SelectItem>
                    <SelectItem value="Barley">Barley</SelectItem>
                    <SelectItem value="Sunflower">Sunflower</SelectItem>
                    <SelectItem value="Tomatoes">Tomatoes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plantingDate">Planting Date</Label>
                <Input
                  id="plantingDate"
                  type="date"
                  value={newField.plantingDate}
                  onChange={(e) => setNewField({ ...newField, plantingDate: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expectedHarvest">Expected Harvest Date</Label>
                <Input
                  id="expectedHarvest"
                  type="date"
                  value={newField.expectedHarvest}
                  onChange={(e) => setNewField({ ...newField, expectedHarvest: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="irrigation">Irrigation Schedule</Label>
                <Select
                  value={newField.irrigationSchedule}
                  onValueChange={(value) => setNewField({ ...newField, irrigationSchedule: value })}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Every other day">Every other day</SelectItem>
                    <SelectItem value="Twice weekly">Twice weekly</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="As needed">As needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddFieldOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddField} className="glow-button">
                Add Field
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Farm Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Area</CardTitle>
              <MapPin className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{farmData.totalArea.toFixed(1)} ha</div>
              <p className="text-xs text-muted-foreground mt-1">
                {farmData.fields.length} fields
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Fields</CardTitle>
              <Leaf className="w-4 h-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeFields}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently growing
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Crops</CardTitle>
              <Sprout className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCrops}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Different crop types
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Irrigation Status</CardTitle>
              <Droplets className="w-4 h-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${irrigationStatus.color}`}>
                {irrigationStatus.status}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeFields > 0 ? `${activeFields} fields monitored` : 'Add fields to start'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Fields List */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Your Fields</CardTitle>
            <CardDescription>
              {farmData.fields.length > 0
                ? `Territories added from map - ${farmData.fields.length} total`
                : 'No territories yet. Use the Map page to draw your fields'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {farmData.fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 rounded-lg glass-card hover:border-primary/30 transition-all"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div>
                      <h3 className="font-semibold text-foreground">{field.name}</h3>
                      <p className="text-sm text-muted-foreground">{field.area} ha</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-primary" />
                        <span className="text-sm">{field.crop}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {field.plantingDate ? new Date(field.plantingDate).toLocaleDateString() : 'Not planted'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {field.expectedHarvest ? new Date(field.expectedHarvest).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">{field.irrigationSchedule}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Badge className={getStatusColor(field.status)}>
                        {field.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteField(field.id)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {farmData.fields.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">No territories yet. Draw your fields on the map!</p>
                  <Button onClick={() => navigate('/map')} className="glow-button">
                    <MapPin className="w-4 h-4 mr-2" />
                    Go to Map
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Navigate to key features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/map')}
              >
                <MapPin className="w-6 h-6 text-primary" />
                <span>View Map & Get AI Plan</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/k-index')}
              >
                <TrendingUp className="w-6 h-6 text-primary" />
                <span>Check K-Index Data</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/analysis')}
              >
                <Calendar className="w-6 h-6 text-primary" />
                <span>View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
