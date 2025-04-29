"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { backOut } from "@/lib/actions"
import { ContentCardFooter } from "@/components/ui/content-card"
import { AlertCircle, CheckCircle } from "lucide-react"

interface BackOutFormProps {
  eventId: number
  onCancel: () => void
  onSuccess: () => void
}

export default function BackOutForm({ eventId, onCancel, onSuccess }: BackOutFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alreadyBackedOut, setAlreadyBackedOut] = useState(false)

  // Reset the already backed out state when the phone number changes
  useEffect(() => {
    if (alreadyBackedOut) {
      setAlreadyBackedOut(false)
    }
  }, [phoneNumber])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!phoneNumber) {
      setError("Please enter your phone number")
      return
    }

    // Validate phone number length
    if (phoneNumber.replace(/\D/g, "").length > 10) {
      setError("Phone number should not exceed 10 digits")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setAlreadyBackedOut(false)

    try {
      await backOut(phoneNumber, eventId)
      onSuccess()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong"

      // Check if this is the "already backed out" error
      if (errorMessage.includes("already marked as 'out'")) {
        setAlreadyBackedOut(true)
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow up to 10 digits
    const value = e.target.value.replace(/\D/g, "").slice(0, 10)

    // Format the phone number as (XXX) XXX-XXXX
    let formattedValue = ""
    if (value.length > 0) {
      formattedValue =
        value.length > 6
          ? `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`
          : value.length > 3
            ? `(${value.slice(0, 3)}) ${value.slice(3)}`
            : `(${value}`
    }

    setPhoneNumber(formattedValue)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="space-y-3">
        <Label htmlFor="phoneNumber" className="text-neutral-500 font-normal">
          Enter your phone number to back out
        </Label>
        <Input
          id="phoneNumber"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="(123) 456-7890"
          required
          maxLength={14} // (XXX) XXX-XXXX format
          className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-6 px-4 text-lg"
        />
        <p className="text-xs text-neutral-400">Enter the same phone number you used when signing up</p>
      </div>

      {alreadyBackedOut ? (
        <div className="bg-green-50 border border-green-100 rounded-md p-4 text-green-600 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Already Backed Out</p>
            <p className="text-sm">This phone number is already marked as 'out'. No need to back out again.</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-md p-4 text-red-600 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : null}

      <ContentCardFooter className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
        >
          Cancel
        </Button>
        {alreadyBackedOut ? (
          <Button
            type="button"
            onClick={onCancel}
            className="bg-neutral-800 hover:bg-neutral-900 text-white rounded-full px-8 py-6 h-auto text-base transition-all"
          >
            Return to Home
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-6 h-auto text-base transition-all"
          >
            {isSubmitting ? "Processing..." : "Back Out"}
          </Button>
        )}
      </ContentCardFooter>
    </form>
  )
}

