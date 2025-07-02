import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Mail, Phone, MapPin, Clock } from "lucide-react";
import React from "react";

export interface OfferItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  icon?: React.ReactNode;
}

export interface OfferTemplateProps {
  offerNumber?: string;
  date?: string;
  validUntil?: string;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  clientName?: string;
  clientCompany?: string;
  clientEmail?: string;
  clientAddress?: string;
  items?: OfferItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  notes?: string;
  projectSummary?: string;
  methodology?: string[];
  included?: string[];
}

export function OfferTemplate({
  offerNumber = "OFFER-001",
  date = new Date().toLocaleDateString(),
  validUntil = "",
  companyName = "Business Name",
  companyEmail = "business@email.com",
  companyPhone = "",
  companyAddress = "",
  clientName = "Customer Name",
  clientCompany = "",
  clientEmail = "",
  clientAddress = "",
  projectSummary = "",
  items = [],
  subtotal = 0,
  tax = 0,
  total = 0,
  notes = "",
  methodology = [],
  included = [],
}: OfferTemplateProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white print:bg-white font-sans text-base text-black">
      <div className="rounded-t-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 mb-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
          <div>
            <h1 className="text-4xl font-extrabold text-white drop-shadow mb-1">{companyName}</h1>
            <p className="text-xl font-semibold text-white/90 tracking-wide">Commercial Offer</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-base font-semibold text-white/80">Offer No.</span>
            <span className="text-base font-bold text-white/90">{offerNumber}</span>
          </div>
        </div>
      </div>

      {/* Project Summary */}
      {projectSummary && (
        <div className="p-8 bg-blue-50/30 border-l-4 border-blue-500">
          <h2 className="mb-4 text-xl font-semibold">Project Overview</h2>
          <p className="leading-relaxed">{projectSummary}</p>
        </div>
      )}

      {/* Offer Details */}
      <div className="p-8 bg-muted/30">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Calendar className="w-5 h-5 text-primary" />
              Offer Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{date}</span>
              </div>
              {validUntil && (
                <div className="flex justify-between">
                  <span>Valid Until:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Clock className="w-3 h-3 mr-1" />
                    {validUntil}
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Client Information</h3>
            <div className="space-y-2">
              <p className="text-lg font-medium">{clientName}</p>
              <p>{clientCompany}</p>
              <p className="text-sm flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {clientEmail}
              </p>
              <p className="text-sm flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {clientAddress}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Methodology Section */}
      {methodology.length > 0 && (
        <div className="p-8">
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <h3 className="mb-4 text-lg font-semibold">Our Methodology</h3>
            <ul className="grid md:grid-cols-2 gap-4 text-sm list-disc pl-5">
              {methodology.map((item, idx) => (
                <li key={idx} className="mb-2">{item}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Services/Items */}
      <div className="p-8">
        <h2 className="mb-6 text-xl font-semibold">Services</h2>
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {item.icon && <div className="text-primary">{item.icon}</div>}
                    <h4 className="font-medium">{item.name}</h4>
                  </div>
                  <p className="text-sm mb-4">{item.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Quantity: {item.quantity}</span>
                    <span>Unit Price: €{item.unitPrice.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold">€{item.total.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="p-8 bg-muted/30">
        <div className="max-w-md ml-auto">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Pricing Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>€{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (21%):</span>
                <span>€{tax.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl">
                <span>Total:</span>
                <span>€{total.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Terms & Notes */}
      {notes && (
        <div className="p-8">
          <Card className="p-6 bg-blue-50/50 border-blue-200">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <span className="text-blue-600">&#9432;</span>
              Terms & Notes
            </h3>
            <p className="leading-relaxed">{notes}</p>
            {included.length > 0 && (
              <div className="mt-6 pt-4 border-t border-blue-200">
                <h4 className="mb-3 font-medium">Included in the price:</h4>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  {included.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Footer/CTA */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-8 rounded-b-lg">
        <div className="text-center">
          <h3 className="mb-4 text-lg font-semibold">Ready to get started?</h3>
          <p className="mb-6 opacity-90">
            Our team is ready to take on your project. Contact us with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center print:hidden">
            <Button variant="secondary" size="lg" className="min-w-40">
              Accept Offer
            </Button>
            <Button variant="outline" size="lg" className="min-w-40 bg-white/10 border-white/20 text-white hover:bg-white/20">
              Schedule a Call
            </Button>
          </div>
        </div>
        <Separator className="my-8 bg-white/20" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {companyEmail}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {companyPhone}
            </span>
          </div>
          <div className="flex items-center gap-1 opacity-75">
            <MapPin className="w-4 h-4" />
            {companyAddress}
          </div>
        </div>
      </div>
    </div>
  );
} 