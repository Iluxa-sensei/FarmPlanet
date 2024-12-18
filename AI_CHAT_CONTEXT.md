# 🤖 AI Chat Territory Context Feature

## Overview
The AI Chat page now supports selecting specific farm territories to provide personalized, context-aware advice based on your actual field data.

## Features

### 1. Territory Selection
- **Territory Dropdown**: Select any of your saved territories from the map
- **None Option**: Choose "None" for general farming advice without specific field context
- **Auto-load**: Territories are automatically loaded from localStorage when you open the chat

### 2. Context Information Display
When you select a territory, the AI assistant receives detailed context including:
- **Territory Name**: The name you gave to your field
- **Area**: Size of the field in hectares
- **Current Crop**: What crop is currently planted
- **Planting Date**: When the crop was planted
- **Days Since Planting**: Automatically calculated
- **Growing Season**: Current week out of total weeks in the AI plan
- **Expected Harvest**: Harvest date from the AI farming plan
- **Current Week Tasks**: Tasks scheduled for the current week

### 3. Visual Context Card
The "Active Context" card displays:
- 📍 Territory name
- 🌿 Current crop with emoji
- 📏 Field area in hectares
- 📅 Planting date
- 🤖 AI Plan status badge (if active)

### 4. Personalized AI Responses
With a territory selected, the AI assistant will:
- Provide advice specific to your crop type
- Consider the growth stage based on planting date
- Reference your field's size in recommendations
- Align suggestions with your AI farming plan tasks
- Give timeline-appropriate advice (e.g., when to fertilize, water, harvest)

## How It Works

### Backend Logic
1. **Load Territories**: On page load, territories are fetched from `localStorage`
2. **Build Context**: When a territory is selected, a context string is built with all relevant field data
3. **Enhanced Prompt**: The context is appended to the system prompt sent to OpenAI
4. **AI Processing**: GPT-4o-mini receives the enhanced prompt and provides personalized advice

### Data Flow
```
User selects territory 
  → Territory data loaded from localStorage
  → Context string built with field details
  → Context added to system prompt
  → OpenAI API called with enhanced prompt
  → AI response considers specific field context
  → User receives personalized advice
```

## Example Use Cases

### Without Territory Context
**User**: "When should I water my crops?"
**AI**: "Generally, water crops when the top 2-3 inches of soil feel dry..."

### With Territory Context (Wheat, 25 ha, Week 3)
**User**: "When should I water my crops?"
**AI**: "For your 25-hectare wheat field (planted 21 days ago, currently in Week 3), you should water when soil moisture drops below 60%. At this vegetative growth stage, wheat needs about 25-30mm of water per week. Given your field size, consider using center pivot irrigation for even coverage..."

## User Interface

### Territory Selector Card
- Located just below the page header
- Only appears if you have saved territories
- Clean, modern glass-card design
- Two-column layout: selector on left, context info on right

### Toast Notifications
- **Territory Activated**: "🌾 Territory Context Activated - AI will now provide personalized advice for [Territory Name]"
- **General Mode**: "🌍 General Mode - AI will provide general farming advice"

## Technical Details

### State Management
```typescript
const [territories, setTerritories] = useState<Territory[]>([]);
const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>('');
```

### Context Building
The `buildTerritoryContext()` function creates a structured context string:
```typescript
📍 SELECTED TERRITORY CONTEXT:
- Name: North Field
- Area: 25.43 hectares
- Current Crop: 🌾 Wheat
- Planting Date: 1/15/2025
- Days Since Planting: 21 days
- Growing Season: Week 3 of 16
- Expected Harvest: 5/15/2025
- Current Week Tasks: Apply nitrogen fertilizer, Monitor for pests, Check soil moisture

Use this context to provide personalized advice for this specific field.
```

### API Integration
The context is seamlessly integrated into the OpenAI system prompt:
```typescript
const systemMessage = `You are an expert agricultural AI assistant...
${territoryContext}`;
```

## Benefits

1. **Precision Advice**: Get recommendations tailored to your specific crop, growth stage, and field size
2. **Timeline Awareness**: AI knows exactly where you are in the growing season
3. **Task Alignment**: Suggestions align with your AI farming plan tasks
4. **Data-Driven**: Uses your actual field data, not generic assumptions
5. **Easy Switching**: Quickly switch between territories or general mode
6. **Visual Clarity**: See exactly what context the AI is using

## Future Enhancements (Potential)
- Weather integration: Add current weather conditions to context
- Soil data: Include soil type and test results
- Historical data: Reference past crop yields and issues
- Multi-territory: Ask questions about multiple fields at once
- Conversation memory: Remember previous questions about the same territory

## Tips for Best Results

1. **Be Specific**: Ask questions related to your selected territory for best results
2. **Use Context**: Reference your field name in questions (e.g., "How is North Field doing?")
3. **Follow Tasks**: Ask about current week tasks from your AI plan
4. **Switch Territories**: Change territories when asking about different fields
5. **General Mode**: Use "None" when asking general farming questions

## Storage
- Territory data is stored in localStorage under key: `farmplanet_territories`
- Chat history is stored separately in: `farmplanet_chat_history`
- Context is rebuilt fresh on each message to ensure accuracy

---

**Note**: This feature requires territories to be created on the Map page first. Draw your fields, add crop details, and generate AI plans to get the most value from context-aware AI chat.



