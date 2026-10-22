const problems_E = [
{
  id:"ext-add16",
  title:"E1 — 16-bit Addition",
  category:"E. 16-bit 運算",
  tags:["ADDWF","ADDWFC","16-bit add","加法"],
  description:"[0x000:0x001] + [0x002:0x003] → [0x010:0x011]（高位:低位）。",
  testcase:"Testcase 1: 0x1234 + 0x5678 = 0x68AC\nTestcase 2: 0x00FF + 0x0001 = 0x0100",
  code:`LIST p=18f4520
#include <p18f4520.inc>
CONFIG OSC = INTIO67
CONFIG WDT = OFF

A_H EQU 0x000
A_L EQU 0x001
B_H EQU 0x002
B_L EQU 0x003
R_H EQU 0x010
R_L EQU 0x011

        ORG 0x0000
MAIN:
        ; --- Initialize 16-bit operands ---
        MOVLW   0x12
        MOVWF   A_H
        MOVLW   0x34
        MOVWF   A_L
        MOVLW   0x56
        MOVWF   B_H
        MOVLW   0x78
        MOVWF   B_L

        ; --- Low byte addition ---
        MOVF    A_L, W
        ADDWF   B_L, W
        MOVWF   R_L

        ; --- High byte addition with carry ---
        MOVF    A_H, W
        ADDWFC  B_H, W
        MOVWF   R_H
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-sub16",
  title:"E2 — 16-bit Subtraction",
  category:"E. 16-bit 運算",
  tags:["SUBWF","SUBWFB","16-bit sub","減法"],
  description:"[0x000:0x001] - [0x002:0x003] → [0x010:0x011]（高位:低位）。",
  testcase:"Testcase 1: 0x5678 - 0x1234 = 0x4444\nTestcase 2: 0x0100 - 0x0001 = 0x00FF",
  code:`LIST p=18f4520
#include <p18f4520.inc>
CONFIG OSC = INTIO67
CONFIG WDT = OFF

A_H EQU 0x000
A_L EQU 0x001
B_H EQU 0x002
B_L EQU 0x003
R_H EQU 0x010
R_L EQU 0x011

        ORG 0x0000
MAIN:
        ; --- Initialize 16-bit operands ---
        MOVLW   0x01
        MOVWF   A_H
        MOVLW   0x00
        MOVWF   A_L
        MOVLW   0x00
        MOVWF   B_H
        MOVLW   0x01
        MOVWF   B_L

        ; --- Low byte subtraction ---
        MOVF    B_L, W
        SUBWF   A_L, W
        MOVWF   R_L

        ; --- High byte subtraction with borrow ---
        MOVF    B_H, W
        SUBWFB  A_H, W
        MOVWF   R_H
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-compare16",
  title:"E3 — 16-bit Unsigned Comparison",
  category:"E. 16-bit 運算",
  tags:["CPFSEQ","CPFSLT","16-bit compare","比較","比較大小"],
  description:"比較 [0x000:0x001] 與 [0x002:0x003]：\n  前者大 → [0x010]=0x11\n  相等  → [0x010]=0x22\n  前者小 → [0x010]=0x33",
  testcase:"Testcase 1: A=0x1256, B=0x1234 → 0x11\nTestcase 2: A=0x1234, B=0x1256 → 0x33\nTestcase 3: A=0x1234, B=0x1234 → 0x22",
  code:`LIST p=18f4520
#include <p18f4520.inc>
CONFIG OSC = INTIO67
CONFIG WDT = OFF

A_H EQU 0x000
A_L EQU 0x001
B_H EQU 0x002
B_L EQU 0x003
OUT EQU 0x010

        ORG 0x0000
MAIN:
        ; --- Initialize 16-bit operands ---
        MOVLW   0x12
        MOVWF   A_H
        MOVLW   0x56
        MOVWF   A_L
        MOVLW   0x12
        MOVWF   B_H
        MOVLW   0x34
        MOVWF   B_L

        ; --- Compare High bytes ---
        MOVF    A_H, W
        CPFSEQ  B_H
        GOTO    HIGH_DIFF

        ; --- Compare Low bytes ---
        MOVF    A_L, W
        CPFSEQ  B_L
        GOTO    LOW_DIFF

        ; --- Equal ---
        MOVLW   0x22
        MOVWF   OUT
        GOTO    DONE

HIGH_DIFF:
        ; --- Determine greater/less based on high byte ---
        MOVF    A_H, W
        CPFSLT  B_H
        GOTO    A_LT_B
        MOVLW   0x11
        MOVWF   OUT
        GOTO    DONE

LOW_DIFF:
        ; --- Determine greater/less based on low byte ---
        MOVF    A_L, W
        CPFSLT  B_L
        GOTO    A_LT_B
        MOVLW   0x11
        MOVWF   OUT
        GOTO    DONE

A_LT_B:
        MOVLW   0x33
        MOVWF   OUT
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-16bit-negate",
  title:"E4 — 16-bit Two's Complement Negate",
  category:"E. 16-bit 運算",
  tags:["COMF","ADDWFC","二補數","負數"],
  description:"將 [0x000:0x001] 的 16-bit 無號數取二補數（即 0 - 原值），結果存到 [0x010:0x011]。\n提示：二補數 = 1 補數 + 1。",
  testcase:"Testcase 1: [0x000:0x001] = 0x00:0x01 → [0x010:0x011] = 0xFF:0xFF\nTestcase 2: [0x000:0x001] = 0x12:0x34 → [0x010:0x011] = 0xED:0xCC",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test value ---
        MOVLW   0x00
        MOVWF   0x000
        MOVLW   0x01
        MOVWF   0x001

        ; --- Low byte: 1's complement + 1 ---
        COMF    0x001, W
        ADDLW   1
        MOVWF   0x011
        
        ; --- High byte: 1's complement + Carry ---
        CLRF    0x010
        COMF    0x000, W
        ADDWFC  0x010, F
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-16bit-shift",
  title:"E5 — 16-bit Logical Right Shift by 1",
  category:"E. 16-bit 運算",
  tags:["RRCF","16-bit shift","移位"],
  description:"將 [0x000:0x001]（高位:低位）邏輯右移 1 位，最高位補 0。結果存回原位。",
  testcase:"Testcase 1: 0x1234 → 0x091A\nTestcase 2: 0x0001 → 0x0000 (Carry=1)",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test value ---
        MOVLW   0x12
        MOVWF   0x000
        MOVLW   0x34
        MOVWF   0x001

        ; --- Shift high byte, MSB gets 0 ---
        BCF     STATUS, C        
        RRCF    0x000, F         
        
        ; --- Shift low byte, MSB gets Carry ---
        RRCF    0x001, F         
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-e6-mul16x8",
  title:"E6 — 16-bit Multiply by 8-bit",
  category:"E. 16-bit 運算",
  tags:["MULWF","16x8","部分積"],
  description:"計算 [0x000:0x001] (16-bit) 乘以 [0x002] (8-bit)，取低 16-bit 結果存回 [0x010:0x011]。\n(假設高位不溢位)",
  testcase:"Testcase 1: 0x0102 * 0x02 = 0x0204\nTestcase 2: 0x1234 * 0x10 = 0x2340",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize operands ---
        MOVLW   0x12
        MOVWF   0x000
        MOVLW   0x34
        MOVWF   0x001
        MOVLW   0x10
        MOVWF   0x002

        ; --- Low byte multiplication ---
        MOVF    0x001, W
        MULWF   0x002
        MOVFF   PRODL, 0x011  ; Store LSB
        MOVFF   PRODH, 0x010  ; Store MSB temporarily

        ; --- High byte multiplication ---
        MOVF    0x000, W
        MULWF   0x002
        ; Only need the lower 8 bits (PRODL) to add to high byte
        MOVF    PRODL, W
        ADDWF   0x010, F
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-e7-mul-sub",
  title:"E7 — Difference of Two 8-bit Products",
  category:"E. 16-bit 運算",
  tags:["MULWF","SUBWF","16-bit sub"],
  description:"計算 (x1 * x2) - (y1 * y2)，結果為 16-bit 有號數存到 [0x010:0x011] (高:低)。",
  testcase:"Testcase 1: x1=0x10, x2=0x02, y1=0x05, y2=0x03 → (32)-(15) = 17 = 0x0011",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- First multiplication (x1 * x2) ---
        MOVF    0x000, W
        MULWF   0x001
        MOVFF   PRODL, 0x010  ; Save low byte
        MOVFF   PRODH, 0x011  ; Save high byte

        ; --- Second multiplication (y1 * y2) ---
        MOVF    0x002, W
        MULWF   0x003
        
        ; --- 16-bit subtraction ---
        MOVF    PRODL, W
        SUBWF   0x010, F      ; Low byte subtraction
        MOVF    PRODH, W
        SUBWFB  0x011, F      ; High byte subtraction with borrow
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-e8-signed-mul",
  title:"E8 — 8-bit Signed Multiplication",
  category:"E. 16-bit 運算",
  tags:["signed mul","MULWF","二補數"],
  description:"計算兩個 8-bit 有號數 [0x000] * [0x001]，將 16-bit 結果存到 [0x010:0x011]。\n必須處理正負號修正 (依 HackMD 演算法)。",
  testcase:"Testcase 1: 0xFF (-1) * 0x02 = -2 = 0xFFFE",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize operands ---
        MOVLW   0xFF        ; -1
        MOVWF   0x000
        MOVLW   0x02        ; 2
        MOVWF   0x001

        ; --- Unsigned multiplication ---
        MOVF    0x000, W
        MULWF   0x001
        MOVFF   PRODL, 0x011
        MOVFF   PRODH, 0x010

        ; --- Sign correction for op1 ---
        BTFSS   0x000, 7
        BRA     CHECK_OP2
        MOVF    0x001, W
        SUBWF   0x010, F

CHECK_OP2:
        ; --- Sign correction for op2 ---
        BTFSS   0x001, 7
        BRA     DONE
        MOVF    0x000, W
        SUBWF   0x010, F
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-e9-div16",
  title:"E9 — 16-bit Divide by Constant 16",
  category:"E. 16-bit 運算",
  tags:["RRCF","移位","除法"],
  description:"將 [0x000:0x001] 的 16-bit 無號數除以 16 (0x10)，商存回原位。\n提示：除以 16 等同於邏輯右移 4 位。",
  testcase:"Testcase 1: 0x0120 / 0x10 = 0x0012",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test value and counter ---
        MOVLW   0x01
        MOVWF   0x000
        MOVLW   0x20
        MOVWF   0x001

        MOVLW   d'4'
        MOVWF   0x002

SHIFT_LOOP:
        ; --- 16-bit logical right shift ---
        BCF     STATUS, C     
        RRCF    0x000, F      
        RRCF    0x001, F      
        DECFSZ  0x002, F
        BRA     SHIFT_LOOP
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-e10-acc16",
  title:"E10 — 16-bit Accumulate Multiple 8-bit Values",
  category:"E. 16-bit 運算",
  tags:["16-bit 累加","ADDWFC","進位"],
  description:"將 [0x100], [0x101], [0x102] 的三個 8-bit 值加總成 16-bit，存到 [0x010:0x011] (低位:高位)。",
  testcase:"Testcase 1: 0xFF + 0xFF + 0x02 = 0x0200 → [0x010]=0x00, [0x011]=0x02",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test values ---
        MOVLW   0xFF
        MOVWF   0x100
        MOVLW   0xFF
        MOVWF   0x101
        MOVLW   0x02
        MOVWF   0x102

        ; --- Clear accumulator ---
        CLRF    0x010       
        CLRF    0x011       

        ; --- Add first value ---
        MOVF    0x100, W
        ADDWF   0x010, F    
        BTFSC   STATUS, C   
        INCF    0x011, F    

        ; --- Add second value ---
        MOVF    0x101, W
        ADDWF   0x010, F
        BTFSC   STATUS, C
        INCF    0x011, F

        ; --- Add third value ---
        MOVF    0x102, W
        ADDWF   0x010, F
        BTFSC   STATUS, C
        INCF    0x011, F
DONE:
        BRA     DONE
        END`
}
];