"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "../../src/components/ui/button"
import { Input } from "../../src/components/ui/input"
import { Textarea } from "./textarea"
import { Card } from "../../src/components/ui/card"
import { Progress } from "./progress"
import { cn } from "@/lib/utils"

interface FormStep {
  id: string
  title: string
  description?: string
  coverImage: string
  type: "text" | "textarea" | "cards"
  question: string
  options?: Array<{
    id: string
    title: string
    description?: string
    image?: string
  }>
  required?: boolean
}

interface FormData {
  [key: string]: string | string[]
}

interface MultiStepFormProps {
  steps?: FormStep[]
  onSubmit?: (data: FormData) => void
  className?: string
}

const defaultSteps: FormStep[] = [
  {
    id: "name",
    title: "Personal Information",
    description: "Tell us about yourself",
    coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop",
    type: "text",
    question: "What's your full name?",
    required: true
  },
  {
    id: "experience",
    title: "Experience Level",
    description: "Choose your current level",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop",
    type: "cards",
    question: "What's your experience level?",
    options: [
      {
        id: "beginner",
        title: "Beginner",
        description: "Just getting started",
        image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=2070&auto=format&fit=crop"
      },
      {
        id: "intermediate",
        title: "Intermediate",
        description: "Some experience under my belt",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
      },
      {
        id: "advanced",
        title: "Advanced",
        description: "Highly experienced professional",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop"
      }
    ],
    required: true
  },
  {
    id: "goals",
    title: "Your Goals",
    description: "What do you want to achieve?",
    coverImage: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2072&auto=format&fit=crop",
    type: "textarea",
    question: "Describe your main goals and what you hope to accomplish",
    required: true
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Select your preferences",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    type: "cards",
    question: "What are your preferred working styles? (Select multiple)",
    options: [
      {
        id: "remote",
        title: "Remote Work",
        description: "Work from anywhere",
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop"
      },
      {
        id: "team",
        title: "Team Collaboration",
        description: "Working with others",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
      },
      {
        id: "flexible",
        title: "Flexible Schedule",
        description: "Work on your own time",
        image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop"
      }
    ],
    required: false
  }
]

export function MultiStepForm({ 
  steps = defaultSteps, 
  onSubmit,
  className 
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({})
  const [isComplete, setIsComplete] = useState(false)

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsComplete(true)
      onSubmit?.(formData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (stepId: string, value: string) => {
    setFormData(prev => ({ ...prev, [stepId]: value }))
  }

  const handleCardSelect = (stepId: string, optionId: string, isMultiple: boolean = false) => {
    if (isMultiple) {
      setFormData(prev => {
        const current = prev[stepId] as string[] || []
        const updated = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId]
        return { ...prev, [stepId]: updated }
      })
    } else {
      setFormData(prev => ({ ...prev, [stepId]: optionId }))
    }
  }

  const isStepValid = (step: FormStep) => {
    if (!step.required) return true
    const value = formData[step.id]
    if (step.type === "cards" && Array.isArray(value)) {
      return value.length > 0
    }
    return value && value.toString().trim().length > 0
  }

  const currentStepData = steps[currentStep]
  const canProceed = isStepValid(currentStepData)

  if (isComplete) {
    return (
      <div className={cn("min-h-screen bg-background flex items-center justify-center p-4", className)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">Thank You!</h2>
          <p className="text-muted-foreground mb-6">
            Your form has been submitted successfully. We'll be in touch soon!
          </p>
          <Button onClick={() => {
            setCurrentStep(0)
            setFormData({})
            setIsComplete(false)
          }}>
            Start Over
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header with Progress */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 gap-8 min-h-[calc(100vh-200px)]"
          >
            {/* Cover Image */}
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={currentStepData.coverImage}
                alt={currentStepData.title}
                className="w-full h-full object-cover min-h-[300px] md:min-h-[500px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {currentStepData.title}
                </h1>
                {currentStepData.description && (
                  <p className="text-lg opacity-90">
                    {currentStepData.description}
                  </p>
                )}
              </div>
            </div>

            {/* Form Content */}
            <div className="flex flex-col justify-center py-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  {currentStepData.question}
                </h2>

                {/* Text Input */}
                {currentStepData.type === "text" && (
                  <Input
                    placeholder="Enter your answer..."
                    value={formData[currentStepData.id] as string || ""}
                    onChange={(e) => handleInputChange(currentStepData.id, e.target.value)}
                    className="text-lg p-4 h-12"
                  />
                )}

                {/* Textarea */}
                {currentStepData.type === "textarea" && (
                  <Textarea
                    placeholder="Enter your answer..."
                    value={formData[currentStepData.id] as string || ""}
                    onChange={(e) => handleInputChange(currentStepData.id, e.target.value)}
                    className="text-lg p-4 min-h-[120px] resize-none"
                  />
                )}

                {/* Card Selection */}
                {currentStepData.type === "cards" && currentStepData.options && (
                  <div className="space-y-4">
                    {currentStepData.options.map((option) => {
                      const isSelected = currentStepData.id === "preferences"
                        ? (formData[currentStepData.id] as string[] || []).includes(option.id)
                        : formData[currentStepData.id] === option.id

                      return (
                        <Card
                          key={option.id}
                          className={cn(
                            "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                            isSelected 
                              ? "ring-2 ring-primary bg-primary/5" 
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => handleCardSelect(
                            currentStepData.id, 
                            option.id, 
                            currentStepData.id === "preferences"
                          )}
                        >
                          <div className="flex items-center space-x-4">
                            {option.image && (
                              <img
                                src={option.image}
                                alt={option.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">
                                {option.title}
                              </h3>
                              {option.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {option.description}
                                </p>
                              )}
                            </div>
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 transition-colors",
                              isSelected 
                                ? "bg-primary border-primary" 
                                : "border-muted-foreground"
                            )}>
                              {isSelected && (
                                <Check className="w-3 h-3 text-primary-foreground m-0.5" />
                              )}
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center space-x-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className="flex items-center space-x-2"
                  >
                    <span>
                      {currentStep === steps.length - 1 ? "Submit" : "Next"}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function MultiStepFormDemo() {
  const handleSubmit = (data: FormData) => {
    console.log("Form submitted:", data)
  }

  return <MultiStepForm onSubmit={handleSubmit} />
} 