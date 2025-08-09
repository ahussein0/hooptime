"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addParticipant } from "@/lib/actions"
import { motion, AnimatePresence } from "framer-motion"
import BackOutForm from "./back-out-form"
import { CheckCircle } from "lucide-react"

interface BasketballSignupProps {
  eventId: number
}

type FormStep = "initial" | "form" | "success" | "backOut"

export default function BasketballSignup({ eventId }: BasketballSignupProps) {
  const [step, setStep] = useState<FormStep>("initial")
  const [status, setStatus] = useState<"in" | "out">("in")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInitialChoice = (choice: "in" | "out") => {
    setStatus(choice)
    if (choice === "out") {
      handleSubmit(null)
    } else {
      setStep("form")
    }
  }

  const handleBackOutClick = () => {
    setStep("backOut")
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formDataObj = new FormData(e.currentTarget)
    const name = formDataObj.get("name") as string
    const phoneNumber = formDataObj.get("phoneNumber") as string

    if (!name || !phoneNumber) {
      setError("Please fill out all required fields")
      return
    }

    if (phoneNumber.replace(/\D/g, "").length > 10) {
      setError("Phone number should not exceed 10 digits")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await addParticipant({
        eventId,
        name,
        phoneNumber,
        status: "in",
      })

      setStep("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | null) => {
    if (e) e.preventDefault()

    setIsSubmitting(true)
    setError(null)

    try {
      if (status === "out") {
        await addParticipant({
          eventId,
          name: "Anonymous",
          phoneNumber: "",
          status: "out",
        })

        setStep("success")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setStep("initial")
    setStatus("in")
    setError(null)
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10)

    let formattedValue = ""
    if (value.length > 0) {
      formattedValue =
        value.length > 6
          ? `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`
          : value.length > 3
            ? `(${value.slice(0, 3)}) ${value.slice(3)}`
            : `(${value}`
    }

    e.target.value = formattedValue
  }

  return (
    <AnimatePresence mode="wait">
      {step === "initial" && (
        <motion.div
          key="initial"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center"
        >
          <h4 className="text-lg font-medium mb-4 text-neutral-900">Are you in?</h4>
          <div className="flex flex-col gap-3 mb-4">
            <Button
              size="sm"
              className="bg-black hover:bg-neutral-800 text-white rounded-full px-6 py-2 text-sm transition-all"
              onClick={() => handleInitialChoice("in")}
            >
              I'm in
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-full px-6 py-2 text-sm transition-all bg-transparent"
              onClick={() => handleInitialChoice("out")}
            >
              I'm out
            </Button>
          </div>

          <div className="pt-3 border-t border-neutral-100">
            <p className="text-neutral-500 text-xs mb-2">Already signed up?</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackOutClick}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
            >
              Back out
            </Button>
          </div>
        </motion.div>
      )}

      {step === "form" && (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onSubmit={handleFormSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name" className="text-neutral-500 font-normal text-sm">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your name"
              required
              className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-2 px-3 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-neutral-500 font-normal text-sm">
              Phone
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              placeholder="(123) 456-7890"
              required
              maxLength={14}
              onChange={handlePhoneNumberChange}
              className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-2 px-3 text-sm"
            />
          </div>

          {error && <div className="text-red-500 text-xs py-1">{error}</div>}

          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep("initial")}
              className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 text-xs"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="bg-black hover:bg-neutral-800 text-white rounded-full px-4 py-2 text-xs transition-all"
            >
              {isSubmitting ? "Signing up..." : "Sign Me Up!"}
            </Button>
          </div>
        </motion.form>
      )}

      {step === "success" && (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center py-4"
        >
          {status === "in" ? (
            <div className="flex flex-col items-center">
              <div className="bg-green-50 p-3 rounded-full mb-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-lg font-bold text-green-600 mb-1">Success! You're in!</h4>
              <p className="text-neutral-600 text-sm mb-4">You've been added to the player list.</p>
            </div>
          ) : (
            <div>
              <h4 className="text-lg font-medium text-neutral-900 mb-2">Maybe next time</h4>
              <p className="mb-4 text-neutral-500 text-sm">We've noted that you won't make it this time</p>
            </div>
          )}

          <Button
            onClick={resetForm}
            size="sm"
            className="bg-black hover:bg-neutral-800 text-white rounded-full px-4 py-2 text-xs transition-all"
          >
            Sign up another player
          </Button>
        </motion.div>
      )}

      {step === "backOut" && (
        <motion.div key="backOut" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <h4 className="text-lg font-medium text-neutral-900 mb-2 text-center">Back Out</h4>
          <p className="mb-4 text-neutral-500 text-center text-sm">Enter your phone number to back out.</p>

          <BackOutForm
            eventId={eventId}
            onCancel={() => setStep("initial")}
            onSuccess={() => {
              setStatus("out")
              setStep("success")
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
