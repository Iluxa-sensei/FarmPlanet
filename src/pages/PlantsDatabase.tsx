import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Filter, Eye, AlertTriangle, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const plantsData = [
  {
    id: 1,
    name: "Deadly Nightshade",
    scientificName: "Atropa belladonna",
    toxicityLevel: "Extremely High",
    riskToAnimals: "Fatal",
    riskToHumans: "Fatal",
    image: "/api/placeholder/200/150",
    symptoms: "Hallucinations, paralysis, respiratory failure",
    firstAid: "Immediate medical attention, induce vomiting if conscious"
  },
  {
    id: 2,
    name: "Poison Ivy",
    scientificName: "Toxicodendron radicans",
    toxicityLevel: "Medium",
    riskToAnimals: "Low",
    riskToHumans: "Medium",
    image: "/api/placeholder/200/150",
    symptoms: "Severe skin rash, blistering, itching",
    firstAid: "Wash with soap and cold water, apply calamine lotion"
  },
  {
    id: 3,
    name: "Giant Hogweed",
    scientificName: "Heracleum mantegazzianum",
    toxicityLevel: "High",
    riskToAnimals: "Medium",
    riskToHumans: "High",
    image: "/api/placeholder/200/150",
    symptoms: "Severe burns, scarring, blindness if eye contact",
    firstAid: "Rinse with water, cover burns, seek medical attention"
  },
  {
    id: 4,
    name: "Foxglove",
    scientificName: "Digitalis purpurea",
    toxicityLevel: "High",
    riskToAnimals: "Fatal",
    riskToHumans: "High",
    image: "/api/placeholder/200/150",
    symptoms: "Heart arrhythmia, nausea, confusion",
    firstAid: "Do not induce vomiting, seek immediate medical help"
  },
  {
    id: 5,
    name: "Castor Bean",
    scientificName: "Ricinus communis",
    toxicityLevel: "Extremely High",
    riskToAnimals: "Fatal",
    riskToHumans: "Fatal",
    image: "/api/placeholder/200/150",
    symptoms: "Severe abdominal pain, vomiting, organ failure",
    firstAid: "Immediate medical attention, supportive care"
  },
  {
    id: 6,
    name: "Water Hemlock",
    scientificName: "Cicuta maculata",
    toxicityLevel: "Extremely High",
    riskToAnimals: "Fatal",
    riskToHumans: "Fatal",
    image: "/api/placeholder/200/150",
    symptoms: "Seizures, respiratory failure, death within hours",
    firstAid: "Emergency medical care, do not induce vomiting"
  }
];

export default function PlantsDatabase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlant, setSelectedPlant] = useState<typeof plantsData[0] | null>(null);

  const filteredPlants = plantsData.filter(plant =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getToxicityColor = (level: string) => {
    switch (level) {
      case "Extremely High": return "destructive";
      case "High": return "destructive";
      case "Medium": return "warning";
      case "Low": return "success";
      default: return "secondary";
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-3 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Plant Database
          </h1>
          <p className="text-muted-foreground">
            Comprehensive database of poisonous plants and their characteristics
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add New Plant
        </Button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search plants by name or scientific name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Toxicity Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="extremely-high">Extremely High</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </motion.div>

      {/* Plants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {filteredPlants.map((plant, index) => (
          <motion.div
            key={plant.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedPlant(plant)}>
              <CardHeader className="pb-3">
                <div className="aspect-video bg-muted/20 rounded-lg flex items-center justify-center mb-3">
                  <Leaf className="w-12 h-12 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">{plant.name}</CardTitle>
                <p className="text-sm text-muted-foreground italic">{plant.scientificName}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Toxicity Level:</span>
                  <Badge variant={getToxicityColor(plant.toxicityLevel) === 'destructive' ? 'destructive' : 'secondary'}>
                    {plant.toxicityLevel}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Animals:</span>
                    <div className={`text-xs ${plant.riskToAnimals === 'Fatal' ? 'text-destructive' :
                        plant.riskToAnimals === 'High' ? 'text-warning' : 'text-success'
                      }`}>
                      {plant.riskToAnimals}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Humans:</span>
                    <div className={`text-xs ${plant.riskToHumans === 'Fatal' ? 'text-destructive' :
                        plant.riskToHumans === 'High' ? 'text-warning' : 'text-success'
                      }`}>
                      {plant.riskToHumans}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Plant Detail Modal */}
      {selectedPlant && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPlant(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  {selectedPlant.name}
                </CardTitle>
                <p className="text-muted-foreground italic">{selectedPlant.scientificName}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-muted/20 rounded-lg flex items-center justify-center">
                  <Leaf className="w-16 h-16 text-muted-foreground" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Risk Assessment</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Toxicity:</span>
                        <Badge variant={getToxicityColor(selectedPlant.toxicityLevel) === 'destructive' ? 'destructive' : 'secondary'}>
                          {selectedPlant.toxicityLevel}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Animal Risk:</span>
                        <span className={
                          selectedPlant.riskToAnimals === 'Fatal' ? 'text-destructive' :
                            selectedPlant.riskToAnimals === 'High' ? 'text-warning' : 'text-success'
                        }>
                          {selectedPlant.riskToAnimals}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Human Risk:</span>
                        <span className={
                          selectedPlant.riskToHumans === 'Fatal' ? 'text-destructive' :
                            selectedPlant.riskToHumans === 'High' ? 'text-warning' : 'text-success'
                        }>
                          {selectedPlant.riskToHumans}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Symptoms</h4>
                    <p className="text-sm text-muted-foreground">{selectedPlant.symptoms}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">First Aid</h4>
                  <p className="text-sm text-muted-foreground">{selectedPlant.firstAid}</p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedPlant(null)}>
                    Close
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90">
                    Edit Plant
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}