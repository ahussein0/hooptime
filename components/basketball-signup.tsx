"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addParticipant } from "@/lib/actions"
import { motion, AnimatePresence } from "framer-motion"
import { ContentCardFooter } from "@/components/ui/content-card"
import BackOutForm from "./back-out-form"
import { CheckCircle } from "lucide-react"

interface BasketballSignupProps {
  eventId: number
}

type FormStep = "initial" | "form" | "payment" | "success" | "backOut"

export default function BasketballSignup({ eventId }: BasketballSignupProps) {
  const [step, setStep] = useState<FormStep>("initial")
  const [status, setStatus] = useState<"in" | "out">("in")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    paymentAmount: 0, // Initialize to 0, but will be overwritten by form input
  })

  // Payment form state
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expDate: "",
    cvv: "",
  })

  const handleInitialChoice = (choice: "in" | "out") => {
    setStatus(choice)
    if (choice === "out") {
      // If they're out, we don't need their details
      handleSubmit(null)
    } else {
      setStep("form")
    }
  }

  const handleBackOutClick = () => {
    setStep("backOut")
  }

  const handlePersonalInfoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Get form data for those who are "in"
    const formDataObj = new FormData(e.currentTarget)
    const name = formDataObj.get("name") as string
    const phoneNumber = formDataObj.get("phoneNumber") as string
    const paymentAmountStr = formDataObj.get("paymentAmount") as string
    const paymentAmount = paymentAmountStr ? Number.parseFloat(paymentAmountStr) : 0

    if (!name || !phoneNumber) {
      setError("Please fill out all required fields")
      return
    }

    // Validate phone number length
    if (phoneNumber.replace(/\D/g, "").length > 10) {
      setError("Phone number should not exceed 10 digits")
      return
    }

    // Update form data state
    setFormData({
      name,
      phoneNumber,
      paymentAmount,
    })

    // Move to payment step
    setStep("payment")
    setError(null)
  }

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { cardNumber, expDate, cvv } = cardData

    if (!cardNumber || !expDate || !cvv) {
      setError("Please fill out all payment fields")
      return
    }

    // Validate card number
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      setError("Card number must be 16 digits")
      return
    }

    // Validate expiration date format (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(expDate)) {
      setError("Expiration date must be in MM/YY format")
      return
    }

    // Validate CVV (exactly 3 digits)
    if (!/^\d{3}$/.test(cvv)) {
      setError("Security code must be 3 digits")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Submit the participant data
      await addParticipant({
        eventId,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        paymentAmount: formData.paymentAmount,
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
        // Just record that they're out without collecting details
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
    setFormData({
      name: "",
      phoneNumber: "",
      paymentAmount: 0,
    })
    setCardData({
      cardNumber: "",
      expDate: "",
      cvv: "",
    })
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

    e.target.value = formattedValue
  }

  // Card number formatting and validation
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 16
    const value = e.target.value.replace(/\D/g, "").slice(0, 16)

    // Format with spaces every 4 digits
    let formattedValue = ""
    for (let i = 0; i < value.length; i += 4) {
      formattedValue += value.slice(i, i + 4) + (i < value.length - 4 ? " " : "")
    }

    setCardData({
      ...cardData,
      cardNumber: formattedValue.trim(),
    })
  }

  // Expiration date formatting and validation
  const handleExpDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digits
    let value = e.target.value.replace(/\D/g, "")

    // Limit to 4 digits (MMYY)
    value = value.slice(0, 4)

    // Format as MM/YY
    let formattedValue = ""
    if (value.length > 0) {
      formattedValue = value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value
    }

    setCardData({
      ...cardData,
      expDate: formattedValue,
    })
  }

  // CVV validation
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to exactly 3
    const value = e.target.value.replace(/\D/g, "").slice(0, 3)

    setCardData({
      ...cardData,
      cvv: value,
    })
  }

  // Handle payment amount change
  const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure it's a valid number
    const value = e.target.value
    if (value === "" || !isNaN(Number.parseFloat(value))) {
      // Valid input, do nothing (allow the default behavior)
    } else {
      // Invalid input, prevent it
      e.preventDefault()
    }
  }

  return (
    <AnimatePresence mode="wait">
      {step === "initial" && (
        <motion.div
          key="initial"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center py-8"
        >
          <h3 className="text-2xl font-medium mb-10 text-neutral-900">Are you in?</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button
              size="lg"
              className="bg-black hover:bg-neutral-800 text-white rounded-full px-8 py-6 h-auto text-lg transition-all"
              onClick={() => handleInitialChoice("in")}
            >
              I'm in
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-full px-8 py-6 h-auto text-lg transition-all"
              onClick={() => handleInitialChoice("out")}
            >
              I'm out
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-neutral-100">
            <p className="text-neutral-500 mb-4">Already signed up?</p>
            <Button
              variant="ghost"
              onClick={handleBackOutClick}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
          onSubmit={handlePersonalInfoSubmit}
          className="space-y-6 py-4"
        >
          <div className="space-y-3">
            <Label htmlFor="name" className="text-neutral-500 font-normal">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your name"
              required
              className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-6 px-4 text-lg"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="phoneNumber" className="text-neutral-500 font-normal">
              Phone
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              placeholder="(123) 456-7890"
              required
              maxLength={14} // (XXX) XXX-XXXX format
              onChange={handlePhoneNumberChange}
              className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-6 px-4 text-lg"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="paymentAmount" className="text-neutral-500 font-normal">
              Payment Amount ($)
            </Label>
            <Input
              id="paymentAmount"
              name="paymentAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter payment amount"
              onChange={handlePaymentAmountChange}
              className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-6 px-4 text-lg"
            />
            <p className="text-xs text-neutral-400">Enter the amount you want to pay</p>
          </div>

          {error && <div className="text-red-500 text-sm py-2">{error}</div>}

          <ContentCardFooter className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep("initial")}
              className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="bg-black hover:bg-neutral-800 text-white rounded-full px-8 py-6 h-auto text-base transition-all"
            >
              Continue to Payment
            </Button>
          </ContentCardFooter>
        </motion.form>
      )}

      {step === "payment" && (
        <motion.form
          key="payment"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onSubmit={handlePaymentSubmit}
          className="space-y-6 py-4"
        >
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-2">Payment Details</h3>
            {formData.paymentAmount > 0 && (
              <p className="text-neutral-500">Amount: ${formData.paymentAmount.toFixed(2)}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="cardNumber" className="text-neutral-500 font-normal">
              Card Number
            </Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              placeholder="0000 0000 0000 0000"
              value={cardData.cardNumber}
              onChange={handleCardNumberChange}
              required
              className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-6 px-4 text-lg font-mono"
            />
            <p className="text-xs text-neutral-400">Enter a 16-digit card number</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="expDate" className="text-neutral-500 font-normal">
                Expiration Date
              </Label>
              <Input
                id="expDate"
                name="expDate"
                placeholder="MM/YY"
                value={cardData.expDate}
                onChange={handleExpDateChange}
                required
                className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-6 px-4 text-lg font-mono"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="cvv" className="text-neutral-500 font-normal">
                Security Code
              </Label>
              <Input
                id="cvv"
                name="cvv"
                placeholder="123"
                value={cardData.cvv}
                onChange={handleCvvChange}
                required
                maxLength={3}
                className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-6 px-4 text-lg font-mono"
              />
              <p className="text-xs text-neutral-400">3-digit code on back of card</p>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm py-2">{error}</div>}

          <ContentCardFooter className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep("form")}
              className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-black hover:bg-neutral-800 text-white rounded-full px-8 py-6 h-auto text-base transition-all"
            >
              {isSubmitting ? "Processing..." : "Complete Signup"}
            </Button>
          </ContentCardFooter>
        </motion.form>
      )}

      {step === "success" && (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center py-12"
        >
          {status === "in" ? (
            <div className="flex flex-col items-center">
              <div className="bg-green-50 p-4 rounded-full mb-6">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold text-green-600 mb-2">Success! You're in!</h3>
              <p className="text-neutral-600 mb-10">You've been added to the player list. See you on the court!</p>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-medium text-neutral-900 mb-4">Maybe next time</h3>
              <p className="mb-10 text-neutral-500">We've noted that you won't make it this time</p>
            </div>
          )}

          <Button
            onClick={resetForm}
            className="bg-black hover:bg-neutral-800 text-white rounded-full px-8 py-6 h-auto text-base transition-all"
          >
            Sign up another player
          </Button>
        </motion.div>
      )}

      {step === "backOut" && (
        <motion.div key="backOut" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <h3 className="text-2xl font-medium text-neutral-900 mb-4 text-center">Back Out</h3>
          <p className="mb-6 text-neutral-500 text-center">
            If you can no longer make it, enter your phone number to back out.
          </p>

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

