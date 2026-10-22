const problems_A = [
{
  id:"ext-mixed-arith",
  title:"A1 — Mixed Add/Sub Arithmetic",
  category:"A. 基礎語法",
  tags:["ADDWF","SUBWF","混合運算","加減"],
  description:"計算 `([0x000] + [0x001]) - ([0x002] + [0x003])`，結果存到 [0x010]。",
  testcase:"Testcase 1:\n  [0x000]=0x30, [0x001]=0x10, [0x002]=0x05, [0x003]=0x02\n  計算 (0x40) - (0x07) → [0x010]=0x39",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test values ---
        MOVLW   0x30
        MOVWF   0x000
        MOVLW   0x10
        MOVWF   0x001
        MOVLW   0x05
        MOVWF   0x002
        MOVLW   0x02
        MOVWF   0x003

        ; --- Calculate (A + B) ---
        MOVF    0x000, W
        ADDWF   0x001, W
        MOVWF   0x010

        ; --- Calculate (C + D) and subtract from previous sum ---
        MOVF    0x002, W
        ADDWF   0x003, W
        SUBWF   0x010, F
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-max8",
  title:"A2-1 — 8-bit Maximum of 4 Values",
  category:"A. 基礎語法",
  tags:["CPFSGT","max","maximum","最大值"],
  description:"讀 [0x000]~[0x003] 四個值，找最大值存到 [0x010]。",
  testcase:"Testcase 1:\n  [0x000]=0x12, [0x001]=0x34, [0x002]=0x1A, [0x003]=0x28\n  → [0x010]=0x34",
  code:`LIST p=18f4520
#include <p18f4520.inc>

ADDR0 EQU 0x000
ADDR1 EQU 0x001
ADDR2 EQU 0x002
ADDR3 EQU 0x003
OUT   EQU 0x010

        ORG 0x0000
MAIN:
        ; --- Initialize test values ---
        MOVLW   0x12
        MOVWF   ADDR0
        MOVLW   0x34
        MOVWF   ADDR1
        MOVLW   0x1A
        MOVWF   ADDR2
        MOVLW   0x28
        MOVWF   ADDR3

        ; --- Assume first value is max ---
        MOVF    ADDR0, W
        MOVWF   OUT

        ; --- Compare and update max for remaining values ---
        MOVF    ADDR1, W
        CPFSGT  OUT
        MOVWF   OUT

        MOVF    ADDR2, W
        CPFSGT  OUT
        MOVWF   OUT

        MOVF    ADDR3, W
        CPFSGT  OUT
        MOVWF   OUT
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-min8",
  title:"A2-2 — 8-bit Minimum of 4 Values",
  category:"A. 基礎語法",
  tags:["CPFSLT","min","minimum","最小值"],
  description:"讀 [0x000]~[0x003] 四個值，找最小值存到 [0x010]。\n核心語法：CPFSLT（skip if f < W）。",
  testcase:"Testcase 1:\n  [0x000]=0x45, [0x001]=0x02, [0x002]=0x67, [0x003]=0x10\n  → [0x010]=0x02",
  code:`LIST p=18f4520
#include <p18f4520.inc>

ADDR0 EQU 0x000
ADDR1 EQU 0x001
ADDR2 EQU 0x002
ADDR3 EQU 0x003
OUT   EQU 0x010

        ORG 0x0000
MAIN:
        ; --- Initialize test values ---
        MOVLW   0x45
        MOVWF   ADDR0
        MOVLW   0x02
        MOVWF   ADDR1
        MOVLW   0x67
        MOVWF   ADDR2
        MOVLW   0x10
        MOVWF   ADDR3

        ; --- Assume first value is min ---
        MOVF    ADDR0, W
        MOVWF   OUT

        ; --- Compare and update min for remaining values ---
        MOVF    ADDR1, W
        CPFSLT  OUT
        MOVWF   OUT

        MOVF    ADDR2, W
        CPFSLT  OUT
        MOVWF   OUT

        MOVF    ADDR3, W
        CPFSLT  OUT
        MOVWF   OUT
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-bubble-sort",
  title:"A3 — Bubble Sort (4 Elements)",
  category:"A. 基礎語法",
  tags:["CPFSGT","bubble sort","氣泡排序","swap"],
  description:"將 [0x100]~[0x103] 的 4 個整數，使用氣泡排序法（遞增）進行排序。\n(為符合基礎語法，使用固定展開比對，不使用迴圈與 FSR)",
  testcase:"Testcase 1: [0x100..0x103] = [0x40, 0x10, 0x30, 0x20]\n  → [0x100..0x103] = [0x10, 0x20, 0x30, 0x40]",
  code:`LIST p=18f4520
#include <p18f4520.inc>

TEMP EQU 0x020

        ORG 0x0000
MAIN:
        ; --- Initialize array ---
        MOVLW   0x40
        MOVWF   0x100
        MOVLW   0x10
        MOVWF   0x101
        MOVLW   0x30
        MOVWF   0x102
        MOVLW   0x20
        MOVWF   0x103

        ; --- Pass 1 ---
        ; Compare 0x100 and 0x101
        MOVF    0x100, W
        CPFSGT  0x101       ; Skip if 0x100 > 0x101
        BRA     P1_2
        MOVFF   0x100, TEMP
        MOVFF   0x101, 0x100
        MOVFF   TEMP, 0x101
P1_2:
        ; Compare 0x101 and 0x102
        MOVF    0x101, W
        CPFSGT  0x102
        BRA     P1_3
        MOVFF   0x101, TEMP
        MOVFF   0x102, 0x101
        MOVFF   TEMP, 0x102
P1_3:
        ; Compare 0x102 and 0x103
        MOVF    0x102, W
        CPFSGT  0x103
        BRA     PASS2
        MOVFF   0x102, TEMP
        MOVFF   0x103, 0x102
        MOVFF   TEMP, 0x103

PASS2:
        ; --- Pass 2 ---
        ; Compare 0x100 and 0x101
        MOVF    0x100, W
        CPFSGT  0x101
        BRA     P2_2
        MOVFF   0x100, TEMP
        MOVFF   0x101, 0x100
        MOVFF   TEMP, 0x101
P2_2:
        ; Compare 0x101 and 0x102
        MOVF    0x101, W
        CPFSGT  0x102
        BRA     PASS3
        MOVFF   0x101, TEMP
        MOVFF   0x102, 0x101
        MOVFF   TEMP, 0x102

PASS3:
        ; --- Pass 3 ---
        ; Compare 0x100 and 0x101
        MOVF    0x100, W
        CPFSGT  0x101
        BRA     DONE
        MOVFF   0x100, TEMP
        MOVFF   0x101, 0x100
        MOVFF   TEMP, 0x101
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-condition-classify",
  title:"A4 — Conditional Classifier",
  category:"A. 基礎語法",
  tags:["CPFSEQ","CPFSLT","條件分類","if-else"],
  description:"輸入 [0x000] 的值，進行條件分類：\n  小於 0x40 → [0x010] = 0x01\n  等於 0x40 → [0x010] = 0x02\n  大於 0x40 → [0x010] = 0x03",
  testcase:"Testcase 1: [0x000]=0x3F → [0x010]=0x01\nTestcase 2: [0x000]=0x40 → [0x010]=0x02\nTestcase 3: [0x000]=0x41 → [0x010]=0x03",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test value ---
        MOVLW   0x3F
        MOVWF   0x000

        ; --- Check for equality first ---
        MOVF    0x000, W
        XORLW   0x40
        BZ      IS_EQUAL

        ; --- Check if less or greater ---
        MOVF    0x000, W
        SUBLW   0x40             ; W = 0x40 - [0x000]
        BC      IS_LESS          ; If C=1, [0x000] <= 0x40
        ; Otherwise, it is greater
        MOVLW   0x03
        GOTO    STORE
IS_LESS:
        MOVLW   0x01
        GOTO    STORE
IS_EQUAL:
        MOVLW   0x02
STORE:
        MOVWF   0x010
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-multi-cond",
  title:"A5 — Multiple Condition Check",
  category:"A. 基礎語法",
  tags:["CPFSEQ","CPFSGT","CPFSLT","多層判斷"],
  description:"給定 x=[0x000], y=[0x001]。\n若 x > y，[0x010]=0x01\n若 x == y，[0x010]=0x02\n若 x < y 且 x == 0，[0x010]=0x03\n若 x < y 且 x != 0，[0x010]=0x04",
  testcase:"Testcase 1: x=0x05, y=0x02 → [0x010]=0x01\nTestcase 2: x=0x00, y=0x02 → [0x010]=0x03",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test values ---
        MOVLW   0x00
        MOVWF   0x000
        MOVLW   0x02
        MOVWF   0x001

        ; --- Check if x == y ---
        MOVF    0x000, W
        CPFSEQ  0x001
        GOTO    NOT_EQUAL

        MOVLW   0x02
        MOVWF   0x010
        GOTO    DONE

NOT_EQUAL:
        ; --- Check if x > y ---
        MOVF    0x000, W
        CPFSLT  0x001       ; Skip if y < x (x > y)
        GOTO    X_LESS_Y

        MOVLW   0x01
        MOVWF   0x010
        GOTO    DONE

X_LESS_Y:
        ; --- Check if x == 0 ---
        MOVF    0x000, W
        BNZ     X_NOT_ZERO

        MOVLW   0x03
        MOVWF   0x010
        GOTO    DONE

X_NOT_ZERO:
        MOVLW   0x04
        MOVWF   0x010
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-block-copy",
  title:"A6 — Memory Block Copy",
  category:"A. 基礎語法",
  tags:["LFSR","POSTINC","複製","間接定址"],
  description:"將 [0x100]~[0x109] 共 10 個 bytes 複製到 [0x200]~[0x209]。必須使用間接定址。",
  testcase:"Testcase 1:\n  [0x100..0x109] = 00,01,02,03,04,05,06,07,08,09\n  → [0x200..0x209] 內容相同",
  code:`LIST p=18f4520
#include <p18f4520.inc>

COUNT EQU 0x020

        ORG 0x0000
MAIN:
        LFSR    0, 0x100
        MOVLW   0x00
        MOVWF   POSTINC0
        
        ; --- Setup FSR pointers and loop counter ---
        LFSR    0, 0x100         ; Source pointer
        LFSR    1, 0x200         ; Destination pointer
        MOVLW   d'10'
        MOVWF   COUNT

COPY_LOOP:
        ; --- Copy byte and increment pointers ---
        MOVF    POSTINC0, W      
        MOVWF   POSTINC1         
        DECFSZ  COUNT, F
        BRA     COPY_LOOP
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-block-fill",
  title:"A7 — Memory Block Fill",
  category:"A. 基礎語法",
  tags:["LFSR","POSTINC","SETF","CLRF","填值"],
  description:"將 [0x100]~[0x10F] (共 16 bytes) 全部填入 0xFF。使用 FSR 與迴圈實作。",
  testcase:"Testcase 1: 執行後 [0x100]~[0x10F] 皆為 0xFF",
  code:`LIST p=18f4520
#include <p18f4520.inc>

COUNT EQU 0x020

        ORG 0x0000
MAIN:
        ; --- Setup FSR pointer and loop counter ---
        LFSR    0, 0x100      
        MOVLW   d'16'         
        MOVWF   COUNT

FILL_LOOP:
        ; --- Fill byte and increment pointer ---
        SETF    POSTINC0      
        DECFSZ  COUNT, F      
        BRA     FILL_LOOP     
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-block-compare",
  title:"A8 — Memory Block Compare",
  category:"A. 基礎語法",
  tags:["LFSR","INDF","CPFSEQ","記憶體比較"],
  description:"比較 [0x100]~[0x103] 與 [0x200]~[0x203] 是否完全相同。\n若相同 → [0x010]=0xFF\n若不同 → [0x010]=0x00",
  testcase:"Testcase 1: 兩區塊內容皆為 01,02,03,04 → [0x010]=0xFF",
  code:`LIST p=18f4520
#include <p18f4520.inc>

COUNT EQU 0x020

        ORG 0x0000
MAIN:
        ; --- Initialize test data (assume identical) ---
        MOVLW   0x01
        MOVWF   0x100
        MOVWF   0x200
        MOVLW   0x02
        MOVWF   0x101
        MOVWF   0x201

        ; --- Setup FSR pointers and loop counter ---
        LFSR    0, 0x100      
        LFSR    1, 0x200      
        MOVLW   d'4'          
        MOVWF   COUNT

CMP_LOOP:
        ; --- Read from both blocks and compare ---
        MOVF    POSTINC0, W   
        CPFSEQ  POSTINC1      
        GOTO    NOT_SAME      

        DECFSZ  COUNT, F      
        BRA     CMP_LOOP      

        ; --- All bytes matched ---
        MOVLW   0xFF
        MOVWF   0x010
        GOTO    DONE

NOT_SAME:
        ; --- Mismatch found ---
        MOVLW   0x00
        MOVWF   0x010
DONE:
        BRA     DONE
        END`
}
];