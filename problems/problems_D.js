const problems_D = [
{
  id:"ext-array-sum",
  title:"D1 — Array Sum using FSR (16-bit result)",
  category:"D. 間接定址",
  tags:["LFSR","POSTINC","ADDWFC","array sum","間接定址","16-bit"],
  description:"[0x000] = N，陣列從 [0x100] 開始。用 FSR 走訪求 16-bit 總和，存到 [0x011]（高）:[0x010]（低）。",
  testcase:"Testcase 2:\n  N=4, 陣列 = [0xFF,0xFF,0xFF,0xFF]\n  sum = 0x03FC → [0x010]=0xFC, [0x011]=0x03",
  code:`LIST p=18f4520
#include <p18f4520.inc>
CONFIG OSC = INTIO67
CONFIG WDT = OFF

N_ADDR   EQU 0x000
SUM_L    EQU 0x010
SUM_H    EQU 0x011
COUNTER  EQU 0x020

        ORG 0x0000
        GOTO MAIN

MAIN:
        ; --- Initialize array and length ---
        MOVLW   d'4'
        MOVWF   N_ADDR
        MOVLW   0xFF
        MOVWF   0x100
        MOVLW   0xFF
        MOVWF   0x101
        MOVLW   0xFF
        MOVWF   0x102
        MOVLW   0xFF
        MOVWF   0x103

        ; --- Setup 16-bit sum and FSR ---
        CLRF    SUM_L
        CLRF    SUM_H
        LFSR    0, 0x100
        MOVF    N_ADDR, W
        MOVWF   COUNTER

SUM_LOOP:
        ; --- Accumulate 16-bit sum ---
        MOVF    POSTINC0, W
        ADDWF   SUM_L, F
        MOVLW   0x00
        ADDWFC  SUM_H, F
        DECFSZ  COUNTER, F
        GOTO    SUM_LOOP
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-array-reverse",
  title:"D2 — Reverse an Array in Place (FSR)",
  category:"D. 間接定址",
  tags:["LFSR","INDF","POSTINC","reverse","反轉","雙指標"],
  description:"[0x000] = N，陣列從 [0x100] 開始。用 FSR 雙指標（頭、尾）在原本區域反轉。",
  testcase:"Testcase 1:\n  N=5, 陣列 = [0x10,0x20,0x30,0x40,0x50]\n  → [0x100..0x104] = [0x50,0x40,0x30,0x20,0x10]",
  code:`LIST p=18f4520
#include <p18f4520.inc>
CONFIG OSC = INTIO67
CONFIG WDT = OFF

N_ADDR   EQU 0x000
PAIRS    EQU 0x020
TEMP     EQU 0x021

        ORG 0x0000
        GOTO MAIN

MAIN:
        ; --- Initialize array and length ---
        MOVLW   d'5'
        MOVWF   N_ADDR
        MOVLW   0x10
        MOVWF   0x100
        MOVLW   0x20
        MOVWF   0x101
        MOVLW   0x30
        MOVWF   0x102
        MOVLW   0x40
        MOVWF   0x103
        MOVLW   0x50
        MOVWF   0x104

        ; --- Calculate number of pairs (N/2) ---
        MOVF    N_ADDR, W
        BCF     STATUS, C
        RRCF    WREG, W
        MOVWF   PAIRS

        ; --- Set head and tail pointers ---
        LFSR    0, 0x100
        LFSR    1, 0x100
        MOVF    N_ADDR, W
        ADDLW   0xFF
        ADDWF   FSR1L, F

REV_LOOP:
        ; --- Swap head and tail ---
        MOVF    INDF0, W
        MOVWF   TEMP
        MOVF    INDF1, W
        MOVWF   INDF0
        MOVF    TEMP, W
        MOVWF   INDF1
        INCF    FSR0L, F
        DECF    FSR1L, F
        DECFSZ  PAIRS, F
        BRA     REV_LOOP
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-d3-copy-mod",
  title:"D3 — Copy and Modify via FSR",
  category:"D. 間接定址",
  tags:["LFSR","ADDLW","複製","加工"],
  description:"將 [0x100]~[0x103] 的值各加上 0x10 後，複製到 [0x200]~[0x203]。",
  testcase:"Testcase 1: [0x100]=0x01 → [0x200]=0x11",
  code:`LIST p=18f4520
#include <p18f4520.inc>

COUNT EQU 0x020

        ORG 0x0000
MAIN:
        ; --- Initialize test data ---
        MOVLW   0x01
        MOVWF   0x100
        MOVLW   0x02
        MOVWF   0x101

        ; --- Setup FSR pointers and counter ---
        LFSR    0, 0x100      ; Source
        LFSR    1, 0x200      ; Destination
        MOVLW   d'4'
        MOVWF   COUNT

COPY_LOOP:
        ; --- Read, modify, and write ---
        MOVF    POSTINC0, W   
        ADDLW   0x10          
        MOVWF   POSTINC1      
        DECFSZ  COUNT, F
        BRA     COPY_LOOP
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-plusw-offset",
  title:"D4 — Offset Addressing using PLUSW",
  category:"D. 間接定址",
  tags:["PLUSW0","偏移","定址"],
  description:"給定基底位址 [0x100]，利用 `PLUSW0` 讀取 [0x100 + offset] 的值。\noffset 存在 WREG 中（例如 0x02）。將讀取到的值存到 [0x010]。",
  testcase:"Testcase 1: [0x100]=0xAA, [0x101]=0xBB, [0x102]=0xCC\n  WREG=0x02 → [0x010] = 0xCC",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test data ---
        MOVLW   0xAA
        MOVWF   0x100
        MOVLW   0xBB
        MOVWF   0x101
        MOVLW   0xCC
        MOVWF   0x102

        ; --- Setup base address and offset ---
        LFSR    0, 0x100
        MOVLW   0x02             ; offset = 2
        MOVF    PLUSW0, W        ; W = [FSR0 + W] = [0x102]
        MOVWF   0x010
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-d5-stack",
  title:"D5 — Stack Implementation using PREINC/POSTDEC",
  category:"D. 間接定址",
  tags:["PREINC","POSTDEC","Stack","堆疊"],
  description:"使用 FSR1 作為 Stack Pointer (初始指向 0x300)。\n實作 Push [0x020] 與 Pop 到 [0x021]。",
  testcase:"Testcase 1: [0x020]=0xAA，Push 後 Pop 到 [0x021] → [0x021]=0xAA",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize Stack Pointer and test data ---
        LFSR    1, 0x300      
        MOVLW   0xAA
        MOVWF   0x020         

        ; --- Push ---
        ; Increment SP first, then write to avoid overwriting top
        MOVF    0x020, W
        MOVWF   PREINC1       

        ; --- Pop ---
        ; Read top first, then decrement SP
        MOVF    POSTDEC1, W   
        MOVWF   0x021
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-bank-access",
  title:"D6 — Bank Select & MOVFF",
  category:"D. 間接定址",
  tags:["MOVLB","MOVWF","MOVFF","Bank","BSR"],
  description:"將 0x410 (Bank 4) 寫入 0x99，再使用 MOVFF 搬移到 0x420 (Bank 4)，最後讀取 0x420 至 0x000。",
  testcase:"Testcase 1: [0x410]=0x99, [0x420]=0x99, [0x000]=0x99",
  code:`LIST p=18f4520
#include <p18f4520.inc>
CONFIG OSC = INTIO67
CONFIG WDT = OFF

        ORG 0x0000
MAIN:
        ; --- Write to Bank 4 ---
        MOVLW   0x99
        MOVLB   0x04
        MOVWF   0x10, 1

        ; --- Move using MOVFF (crosses banks automatically) ---
        MOVFF   0x410, 0x420

        ; --- Read back to Bank 0 ---
        MOVF    0x420, W
        MOVLB   0x00
        MOVWF   0x000, 1
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-fibonacci-fsr",
  title:"D7 — Fibonacci Sequence via Indirect Addressing",
  category:"D. 間接定址",
  tags:["LFSR","費氏","序列","POSTINC"],
  description:"從 [0x100] 開始產生 8 個費氏數列的值：0, 1, 1, 2, 3, 5, 8, 13 (0x0D)。必須使用 FSR 存取。",
  testcase:"Testcase 1:\n  → [0x100..0x107] = 00, 01, 01, 02, 03, 05, 08, 0D",
  code:`LIST p=18f4520
#include <p18f4520.inc>
CONFIG OSC = INTIO67
CONFIG WDT = OFF

COUNT EQU 0x020

        ORG 0x0000
MAIN:
        ; --- Initialize first two Fibonacci numbers ---
        LFSR    0, 0x100
        MOVLW   0x00
        MOVWF   POSTINC0
        MOVLW   0x01
        MOVWF   POSTINC0
        
        ; --- Setup for remaining 6 numbers ---
        MOVLW   d'6'
        MOVWF   COUNT

        LFSR    0, 0x100
        LFSR    1, 0x101

FIB_LOOP:
        ; --- Calculate next number and store ---
        MOVF    INDF0, W
        ADDWF   INDF1, W
        MOVWF   POSTINC1
        INCF    FSR0L, F
        DECFSZ  COUNT, F
        BRA     FIB_LOOP
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-array-max",
  title:"D8 — Array Maximum using FSR",
  category:"D. 間接定址",
  tags:["LFSR","POSTINC","CPFSGT","array max","間接定址"],
  description:"[0x000] = N（陣列長度），陣列從 [0x100] 開始。找最大值存到 [0x010]。必須用 FSR 走訪。",
  testcase:"Testcase 1:\n  N=5, 陣列 = [0x10,0x25,0x08,0x33,0x12]\n  → [0x010] = 0x33",
  code:`LIST p=18f4520
#include <p18f4520.inc>
CONFIG OSC = INTIO67
CONFIG WDT = OFF

N_ADDR   EQU 0x000
MAX_ADDR EQU 0x010
COUNTER  EQU 0x020

        ORG 0x0000
        GOTO MAIN

MAIN:
        ; --- Initialize array and length ---
        MOVLW   d'5'
        MOVWF   N_ADDR
        MOVLW   0x10
        MOVWF   0x100
        MOVLW   0x25
        MOVWF   0x101
        MOVLW   0x08
        MOVWF   0x102
        MOVLW   0x33
        MOVWF   0x103
        MOVLW   0x12
        MOVWF   0x104

        ; --- Setup FSR and counter ---
        LFSR    0, 0x100
        MOVF    N_ADDR, W
        MOVWF   COUNTER

        ; --- Assume first element is max ---
        MOVF    POSTINC0, W
        MOVWF   MAX_ADDR
        DECF    COUNTER, F

ARR_LOOP:
        ; --- Compare and update max ---
        MOVF    POSTINC0, W
        CPFSGT  MAX_ADDR
        MOVWF   MAX_ADDR
        DECFSZ  COUNTER, F
        GOTO    ARR_LOOP
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-d9-interleave",
  title:"D9 — Interleave Two Arrays via Indirect Addressing",
  category:"D. 間接定址",
  tags:["LFSR","交錯合併","陣列"],
  description:"將 [0x100]~[0x103] (A) 與 [0x200]~[0x203] (B) 交錯合併到 [0x300]~[0x307]。\n結果依序為 A0, B0, A1, B1...",
  testcase:"Testcase 1: A=[1,2], B=[3,4] → C=[1,3,2,4]",
  code:`LIST p=18f4520
#include <p18f4520.inc>

COUNT EQU 0x020

        ORG 0x0000
MAIN:
        ; --- Setup FSR pointers and counter ---
        LFSR    0, 0x100      ; Pointer A
        LFSR    1, 0x200      ; Pointer B
        LFSR    2, 0x300      ; Pointer C
        MOVLW   d'4'
        MOVWF   COUNT

MERGE_LOOP:
        ; --- Interleave elements from A and B ---
        MOVF    POSTINC0, W   
        MOVWF   POSTINC2      
        
        MOVF    POSTINC1, W   
        MOVWF   POSTINC2      
        
        DECFSZ  COUNT, F
        BRA     MERGE_LOOP
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-d10-movff",
  title:"D10 — Move High Address Data using MOVFF",
  category:"D. 間接定址",
  tags:["MOVFF","高地址","Bank"],
  description:"將位於 Bank 4 的 [0x410] 的內容，搬移到 Bank 5 的 [0x520]。全程不需要切換 BSR。",
  testcase:"Testcase 1: [0x410]=0xAB → [0x520]=0xAB",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Write test data to Bank 4 ---
        MOVLW   0xAB
        MOVLB   0x04        
        MOVWF   0x10, 1     ; Write to 0x410

        ; --- Move cross-bank using MOVFF ---
        ; MOVFF takes full 12-bit address, bypassing BSR
        MOVFF   0x410, 0x520
DONE:
        BRA     DONE
        END`
}
];