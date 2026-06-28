import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faClipboardList,
  faClock,
  faCamera,
  faCircleCheck,
  faFaceMeh,
  faTriangleExclamation,
  faPenToSquare,
  faChartBar,
  faLightbulb,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { REQUIRED_EVIDENCE_IMAGES } from "@/lib/images";
import { SUPPORTED_IMAGE_FORMATS_LABEL } from "@/lib/image-formats";
import { REPORT_CUTOFF_HOUR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "คู่มือการส่งรายงาน | คณะสีแดง โรงเรียนจอมทอง",
  description:
    "คู่มือสำหรับนักเรียนคณะสีแดง วิธีส่งรายงานการทำความสะอาด ถ่ายรูปหลักฐาน และแก้ไขรายงาน",
};

const steps = [
  {
    title: "เลือกห้องหรือพื้นที่ที่รับผิดชอบ",
    detail:
      "เลือกชื่อห้อง/พื้นที่ของคณะสีแดงที่ตัวเองดูแล ถ้าไม่แน่ใจให้ถามครูที่ปรึกษาหรือหัวหน้าห้องก่อนกดส่ง",
  },
  {
    title: "กรอกชื่อและเบอร์โทรผู้รายงาน",
    detail:
      "ใส่ชื่อจริงของผู้ที่ลงพื้นที่ตรวจและเบอร์โทรที่ติดต่อได้ ระบบจะใช้เบอร์นี้ยืนยันตัวตนเมื่อต้องการแก้ไขรายงานภายหลัง",
  },
  {
    title: "เลือกสถานะความสะอาด",
    detail:
      "ประเมินตามความเป็นจริงของพื้นที่วันนั้น ไม่ต้องกังวลถ้าไม่สะอาดมาก — แจ้งตรง ๆ จะช่วยให้ทีมงานจัดการได้ทัน",
  },
  {
    title: "เขียนรายละเอียดสั้น ๆ",
    detail:
      "บอกว่าทำอะไรไปบ้าง เช่น กวาดพื้น เก็บขยะ จัดโต๊ะ หรือจุดที่ยังต้องปรับปรุง อ่านแล้วเข้าใจได้ทันที",
  },
  {
    title: `แนบรูปหลักฐานครบ ${REQUIRED_EVIDENCE_IMAGES} รูป`,
    detail:
      "ถ่ายมุมต่าง ๆ ของพื้นที่ให้เห็นชัดว่าทำความสะอาดแล้ว รูปต้องไม่ซ้ำกัน และต้องเลือกห้องก่อนอัพโหลด",
  },
  {
    title: "กดส่งรายงาน",
    detail:
      "ตรวจสอบข้อมูลอีกครั้งแล้วกดส่ง ห้องละ 1 รายงานต่อวัน — ถ้าส่งไปแล้วจะส่งซ้ำไม่ได้",
  },
];

const faq = [
  {
    q: "ส่งรายงานได้วันไหนบ้าง?",
    a: "ส่งได้เฉพาะวันจันทร์–ศุกร์ และต้องส่งภายในเวลา 19:00 น. ของวันนั้น",
  },
  {
    q: "ส่งไปแล้วแก้ไขได้ไหม?",
    a: `แก้ไขได้ก่อน ${REPORT_CUTOFF_HOUR}:00 น. ของวันเดียวกัน โดยไปที่หน้าสถานะรายงาน แล้วกดแก้ไข พร้อมกรอกเบอร์โทรเดิมเพื่อยืนยันตัวตน`,
  },
  {
    q: "ทำไมอัพโหลดรูปไม่ได้?",
    a: `ตรวจสอบว่าเลือกห้องแล้ว รูปเป็นไฟล์ ${SUPPORTED_IMAGE_FORMATS_LABEL} ไม่ซ้ำกับช่องอื่น ขนาดไม่เกิน 20MB และยังอยู่ในช่วงเวลาส่งรายงาน`,
  },
  {
    q: "ห้องละกี่รายงานต่อวัน?",
    a: "ห้องละ 1 รายงานต่อวัน ถ้าส่งแล้วให้ใช้การแก้ไขแทนการส่งใหม่",
  },
];

export default function GuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-br from-red-50/80 to-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-xl shrink-0">
              <FontAwesomeIcon
                icon={faBookOpen}
                className="text-red-600 text-xl"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                คู่มือการส่งรายงาน
              </h1>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                คู่มือฉบับนี้อธิบายวิธีส่งรายงานการทำความสะอาดพื้นที่รับผิดชอบ
                สำหรับนักเรียนคณะสีแดง โรงเรียนจอมทอง
                อ่านครั้งเดียวแล้วทำตามได้เลย
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-10">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              ระบบนี้ใช้ทำอะไร?
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              ทุกวันจันทร์–ศุกร์ นักเรียนที่รับผิดชอบแต่ละห้องหรือพื้นที่
              ต้องส่งรายงานว่าทำความสะอาดแล้วหรือยัง พร้อมรูปหลักฐาน
              เพื่อให้คณะสีแดงตรวจสอบและติดตามได้ว่าห้องไหนส่งแล้ว ห้องไหนยังไม่ส่ง
            </p>
          </section>

          <section className="p-4 rounded-xl border border-amber-200 bg-amber-50/70">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon
                icon={faClock}
                className="text-amber-600 mt-0.5 shrink-0"
              />
              <div>
                <h2 className="font-bold text-amber-900">เวลาส่งรายงาน</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-amber-900/90">
                  <li>• ส่งได้เฉพาะ <strong>วันจันทร์ – ศุกร์</strong></li>
                  <li>
                    • ส่งได้ถึง <strong>{REPORT_CUTOFF_HOUR}:00 น.</strong>{" "}
                    ของวันนั้นเท่านั้น
                  </li>
                  <li>• วันเสาร์–อาทิตย์และหลัง 19:00 น. ระบบจะปิดการส่ง</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faClipboardList} className="text-red-500" />
              ขั้นตอนการส่งรายงาน
            </h2>
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-white text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-red-600 hover:text-red-700"
            >
              ไปหน้าส่งรายงาน →
            </Link>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faCamera} className="text-red-500" />
              การถ่ายรูปหลักฐาน
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-4 rounded-xl border border-gray-100 text-sm text-gray-600 leading-relaxed">
                <p className="font-semibold text-gray-900 mb-2">ต้องทำอย่างไร</p>
                <ul className="space-y-1.5">
                  <li>• แนบครบ {REQUIRED_EVIDENCE_IMAGES} รูปทุกครั้ง</li>
                  <li>• รูปแต่ละช่องต้องไม่ซ้ำกัน</li>
                  <li>• ถ่ายแนวตั้งหรือแนวนอนก็ได้ ระบบปรับมุมอัตโนมัติ</li>
                  <li>• ถ่ายให้เห็นพื้นที่ชัด แสงพอ ไม่เบลอ</li>
                  <li>• รองรับ {SUPPORTED_IMAGE_FORMATS_LABEL}</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/50 text-sm text-sky-900 leading-relaxed">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faLightbulb} className="text-sky-600" />
                  เคล็ดลับถ่ายรูป
                </p>
                <ul className="space-y-1.5">
                  <li>• ถ่ายหลายมุม เช่น หน้าห้อง กลางห้อง มุมขยะ</li>
                  <li>• ถ่ายก่อน–หลังเก็บ ถ้ามีจุดที่เพิ่งจัดใหม่</li>
                  <li>• อย่าใช้รูปเดิมซ้ำในช่องอื่น</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              เลือกสถานะความสะอาดอย่างไร?
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="text-emerald-500 mt-0.5"
                />
                <div>
                  <p className="font-semibold text-emerald-800">สะอาดดี</p>
                  <p className="text-sm text-emerald-900/80 mt-1">
                    พื้นที่เรียบร้อย ไม่มีขยะหรือสิ่งของวางเกะกะ
                    นักเรียนสามารถใช้งานได้สบาย
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-100 bg-amber-50/50">
                <FontAwesomeIcon
                  icon={faFaceMeh}
                  className="text-amber-500 mt-0.5"
                />
                <div>
                  <p className="font-semibold text-amber-800">สะอาดพอใช้</p>
                  <p className="text-sm text-amber-900/80 mt-1">
                    โดยรวมสะอาดแล้ว แต่ยังมีจุดเล็กน้อยที่ควรเก็บเพิ่ม
                    เช่น ฝุ่นบางมุม หรือของเล็กน้อยที่ยังไม่จัด
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl border border-red-100 bg-red-50/50">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="text-red-500 mt-0.5"
                />
                <div>
                  <p className="font-semibold text-red-800">ต้องปรับปรุง</p>
                  <p className="text-sm text-red-900/80 mt-1">
                    ยังไม่เรียบร้อย มีขยะ สิ่งของเกะกะ หรือสภาพที่ต้องรีบจัดการ
                    ให้เขียนรายละเอียดในช่องคำอธิบายด้วยว่าติดปัญหาอะไร
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faPenToSquare} className="text-red-500" />
              แก้ไขรายงานที่ส่งแล้ว
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              ถ้าส่งผิดหรืออยากเพิ่มรูป สามารถแก้ไขได้ก่อน{" "}
              <strong>{REPORT_CUTOFF_HOUR}:00 น.</strong> ของวันเดียวกัน
              โดยไปที่หน้า{" "}
              <Link href="/status" className="text-red-600 hover:underline">
                สถานะรายงาน
              </Link>{" "}
              แล้วกดแก้ไขรายงานของห้องตัวเอง จากนั้นกรอกเบอร์โทรเดิมที่ใช้ตอนส่ง
              เพื่อยืนยันว่าเป็นผู้รายงานจริง
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartBar} className="text-red-500" />
              ตรวจสอบว่าห้องส่งแล้วหรือยัง
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              เปิดหน้า{" "}
              <Link href="/status" className="text-red-600 hover:underline">
                สถานะรายงาน
              </Link>{" "}
              จะเห็นรายชื่อห้องทั้งหมด พร้อมสถานะว่าส่งแล้วหรือยังไม่ส่ง
              กดที่การ์ดด้านบนเพื่อกรองดูเฉพาะห้องที่ต้องการได้
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faCircleQuestion} className="text-red-500" />
              คำถามที่พบบ่อย
            </h2>
            <div className="space-y-3">
              {faq.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-xl border border-gray-100 bg-white open:bg-gray-50/50"
                >
                  <summary className="cursor-pointer list-none px-4 py-3.5 text-sm font-semibold text-gray-900 flex items-center justify-between gap-3">
                    {item.q}
                    <span className="text-gray-400 text-xs group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="p-4 rounded-xl bg-red-50 border border-red-100 text-center">
            <p className="text-sm text-red-800 font-medium">
              พร้อมส่งรายงานแล้ว? ไปที่หน้าส่งรายงานและทำตามขั้นตอนด้านบนได้เลย
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center mt-3 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              เริ่มส่งรายงาน
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}