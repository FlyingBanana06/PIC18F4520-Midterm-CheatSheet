const problems_F = [
{
  id:"ext-macro-add3",
  title:"F1 — Macro Implementation for Multiple Additions",
  category:"F. 副程式與 Macro",
  tags:["macro","ADDWF","巨集"],
  description:"定義一個 Macro `Add3 a, b, c, out`，將三個記憶體位址的值相加，結果存入 out。呼叫 `Add3 0x000, 0x001, 0x002, 0x010`。",
  testcase:"Testcase 1: [0x000]=0x10, [0x001]=0x20, [0x002]=0x30 → [0x010]=0x60",
  code:`LIST p=18f4520
#include <p18f4520.inc>

Add3 MACRO a, b, c, out
        MOVF    a, W
        ADDWF   b, W
        ADDWF   c, W
        MOVWF   out
        ENDM

        ORG 0x0000
MAIN:
        ; --- Initialize test values ---
        MOVLW   0x10
        MOVWF   0x000
        MOVLW   0x20
        MOVWF   0x001
        MOVLW   0x30
        MOVWF   0x002

        ; --- Call macro ---
        Add3    0x000, 0x001, 0x002, 0x010
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-macro-cmp",
  title:"F2 — Macro Compare & Store",
  category:"F. 副程式與 Macro",
  tags:["macro","compare","CPFSGT","local label","巨集"],
  description:"定義一個 macro `CmpAndStore x, y, out`：比較記憶體位址 x 與 y。\n若 x > y，out = 0x11；若 x == y，out = 0x22；若 x < y，out = 0x33。\n注意：macro 內部的 label 必須使用 `local`。",
  testcase:"Testcase 1: x=0x10, y=0x05 → out=0x11\nTestcase 2: x=0x05, y=0x05 → out=0x22",
  code:`LIST p=18f4520
#include <p18f4520.inc>
CONFIG OSC = INTIO67
CONFIG WDT = OFF

CmpAndStore MACRO x, y, out
        local NOT_EQ, X_LT_Y, DONE_MACRO
        MOVF    x, W
        CPFSEQ  y
        GOTO    NOT_EQ
        MOVLW   0x22
        MOVWF   out
        GOTO    DONE_MACRO
NOT_EQ:
        MOVF    x, W
        CPFSLT  y
        GOTO    X_LT_Y
        MOVLW   0x11
        MOVWF   out
        GOTO    DONE_MACRO
X_LT_Y:
        MOVLW   0x33
        MOVWF   out
DONE_MACRO:
ENDM

        ORG 0x0000
MAIN:
        ; --- Initialize test values ---
        MOVLW   0x10
        MOVWF   0x000
        MOVLW   0x05
        MOVWF   0x001
        
        ; --- Call macro ---
        CmpAndStore 0x000, 0x001, 0x010
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-f3-sum-avg",
  title:"F3 — Subroutine to Calculate Sum/Average",
  category:"F. 副程式與 Macro",
  tags:["RCALL","FSR","平均","除法"],
  description:"寫一個副程式 `CalcAvg`，計算 [0x100]~[0x103] (共4個值) 的平均值，存到 [0x010]。\n(提示：加總後除以 4，可用右移 2 次實作)。",
  testcase:"Testcase 1: 10 + 20 + 30 + 40 = 100 / 4 = 25 (0x19)",
  code:`LIST p=18f4520
#include <p18f4520.inc>

SUM EQU 0x020
CNT EQU 0x021

        ORG 0x0000
MAIN:
        ; --- Initialize test array ---
        MOVLW   d'10'
        MOVWF   0x100
        MOVLW   d'20'
        MOVWF   0x101
        MOVLW   d'30'
        MOVWF   0x102
        MOVLW   d'40'
        MOVWF   0x103

        RCALL   CalcAvg
DONE:
        BRA     DONE

; ==========================================
; Subroutine: CalcAvg
; ==========================================
CalcAvg:
        ; --- Calculate sum ---
        CLRF    SUM
        LFSR    0, 0x100
        MOVLW   d'4'
        MOVWF   CNT

SUM_LOOP:
        MOVF    POSTINC0, W
        ADDWF   SUM, F
        DECFSZ  CNT, F
        BRA     SUM_LOOP

        ; --- Divide by 4 (shift right twice) ---
        BCF     STATUS, C
        RRCF    SUM, F
        BCF     STATUS, C
        RRCF    SUM, F

        MOVF    SUM, W
        MOVWF   0x010
        RETURN
        END`
},
{
  id:"ext-f4-swap",
  title:"F4 — Subroutine to Swap Two Memory Values",
  category:"F. 副程式與 Macro",
  tags:["RCALL","SWAP","副程式"],
  description:"寫一個副程式 `Swap_Regs`，交換 [0x000] 與 [0x001] 的內容。",
  testcase:"Testcase 1: 交換前 0x11, 0x22 → 交換後 0x22, 0x11",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test values ---
        MOVLW   0x11
        MOVWF   0x000
        MOVLW   0x22
        MOVWF   0x001

        RCALL   Swap_Regs     
DONE:
        BRA     DONE

; ==========================================
; Subroutine: Swap_Regs
; ==========================================
Swap_Regs:
        ; --- Swap using temporary register 0x002 ---
        MOVFF   0x000, 0x002  
        MOVFF   0x001, 0x000  
        MOVFF   0x002, 0x001  
        RETURN                
        END`
},
{
  id:"ext-f5-prime",
  title:"F5 — Subroutine to Check Prime",
  category:"F. 副程式與 Macro",
  tags:["質數","除法","餘數","RCALL"],
  description:"寫一個副程式 `IsPrime`，判斷 [0x000] 是否為質數。\n是質數 → [0x010]=0xFF\n不是 → [0x010]=0x00\n(假設輸入 >= 2) (使用重複減法實作 mod)",
  testcase:"Testcase 1: 7 -> 0xFF\nTestcase 2: 10 -> 0x00",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test value ---
        MOVLW   d'7'
        MOVWF   0x000
        RCALL   IsPrime
DONE:
        BRA     DONE

; ==========================================
; Subroutine: IsPrime
; Input: 0x000 (>=2)
; Output: 0x010 (0xFF=Prime, 0x00=Not Prime)
; ==========================================
IsPrime:
        MOVLW   d'2'
        MOVWF   0x001         ; Divisor starts at 2

CHECK_LOOP:
        ; --- If divisor == dividend, it's prime ---
        MOVF    0x001, W
        CPFSEQ  0x000
        BRA     DO_MOD
        
        MOVLW   0xFF
        MOVWF   0x010
        RETURN

DO_MOD:
        ; --- Modulo using repeated subtraction ---
        MOVF    0x000, W
        MOVWF   0x002         
MOD_LOOP:
        MOVF    0x001, W
        CPFSLT  0x002         
        BRA     NEXT_DIV      
        
        MOVF    0x001, W
        SUBWF   0x002, F      
        BRA     MOD_LOOP

NEXT_DIV:
        ; --- Check remainder ---
        MOVF    0x002, W
        BZ      NOT_PRIME     
        
        INCF    0x001, F      ; Divisor++
        BRA     CHECK_LOOP

NOT_PRIME:
        MOVLW   0x00
        MOVWF   0x010
        RETURN
        END`
},
{
  id:"ext-gcd",
  title:"F6 — GCD Subroutine (Euclidean)",
  category:"F. 副程式與 Macro",
  tags:["GCD","Euclidean","subroutine","CPFSLT","CPFSEQ","最大公因數"],
  description:"計算 [0x000] 與 [0x001] 的 GCD，存到 [0x010]。\n使用歐幾里得演算法（重複減法實作 mod）。",
  testcase:"Testcase 1: GCD(48, 18) = 6\nTestcase 2: GCD(100, 75) = 25",
  code:`LIST p=18f4520
#include <p18f4520.inc>
CONFIG OSC = INTIO67
CONFIG WDT = OFF

A_ADDR EQU 0x000
B_ADDR EQU 0x001
R_ADDR EQU 0x010
A_VAR EQU 0x002
B_VAR EQU 0x003
TMP_V EQU 0x004

        ORG 0x0000
MAIN:
        ; --- Initialize test values ---
        MOVLW   d'48'
        MOVWF   A_ADDR
        MOVLW   d'18'
        MOVWF   B_ADDR

        MOVF    A_ADDR, W
        MOVWF   A_VAR
        MOVF    B_ADDR, W
        MOVWF   B_VAR

GCD_LOOP:
        ; --- Loop until B is 0 ---
        MOVF    B_VAR, W
        BZ      GCD_DONE

SUB_LOOP:
        ; --- A = A - B while A >= B ---
        MOVF    B_VAR, W
        CPFSLT  A_VAR
        GOTO    DO_SUB
        GOTO    AFTER_SUB

DO_SUB:
        MOVF    B_VAR, W
        SUBWF   A_VAR, F
        GOTO    SUB_LOOP

AFTER_SUB:
        ; --- Swap A and B ---
        MOVFF   B_VAR, TMP_V
        MOVFF   A_VAR, B_VAR
        MOVFF   TMP_V, A_VAR
        GOTO    GCD_LOOP

GCD_DONE:
        MOVFF   A_VAR, R_ADDR
DONE:
        BRA     DONE
        END`
},
{
  id:"ext-f7-div16",
  title:"F7 — Subroutine for 16-bit Division",
  category:"F. 副程式與 Macro",
  tags:["division","16-bit divide","RCALL","移位相減"],
  description:"實作副程式 `Division16`，計算 [0x000:0x001] (被除數) / [0x002:0x003] (除數)。\n商存到 [0x010:0x011]，餘數存到 [0x012:0x013]。",
  testcase:"Testcase 1: 0x0010 / 0x0003 = 商 0x0005, 餘 0x0001",
  code:`LIST p=18f4520
#include <p18f4520.inc>

DIVIDEND_H EQU 0x000
DIVIDEND_L EQU 0x001
DIVISOR_H  EQU 0x002
DIVISOR_L  EQU 0x003
QUOT_H     EQU 0x010
QUOT_L     EQU 0x011
REM_H      EQU 0x012
REM_L      EQU 0x013
CNT        EQU 0x020

        ORG 0x0000
MAIN:
        ; --- Initialize operands ---
        MOVLW   0x00
        MOVWF   DIVIDEND_H
        MOVLW   0x10
        MOVWF   DIVIDEND_L
        MOVLW   0x00
        MOVWF   DIVISOR_H
        MOVLW   0x03
        MOVWF   DIVISOR_L

        RCALL   Division16
DONE:
        BRA     DONE

Division16:
        ; --- Initialize quotient and remainder ---
        CLRF    QUOT_H
        CLRF    QUOT_L
        CLRF    REM_H
        CLRF    REM_L
        MOVLW   d'16'
        MOVWF   CNT

DIV_LOOP:
        ; --- Shift dividend left, MSB goes to remainder ---
        BCF     STATUS, C
        RLCF    DIVIDEND_L, F
        RLCF    DIVIDEND_H, F
        RLCF    REM_L, F
        RLCF    REM_H, F

        ; --- Compare remainder with divisor ---
        MOVF    DIVISOR_L, W
        SUBWF   REM_L, W
        MOVF    DIVISOR_H, W
        SUBWFB  REM_H, W
        BNC     NEXT_BIT    ; If remainder < divisor, skip subtraction

        ; --- Subtract divisor from remainder ---
        MOVF    DIVISOR_L, W
        SUBWF   REM_L, F
        MOVF    DIVISOR_H, W
        SUBWFB  REM_H, F
        BSF     STATUS, C   ; Set C=1 to shift into quotient

NEXT_BIT:
        ; --- Shift C into quotient ---
        RLCF    QUOT_L, F   
        RLCF    QUOT_H, F
        DECFSZ  CNT, F
        BRA     DIV_LOOP
        RETURN
        END`
},
{
  id:"ext-save-wreg",
  title:"F8 — Save WREG/STATUS in Subroutine",
  category:"F. 副程式與 Macro",
  tags:["SWAPF","STATUS","WREG","保護暫存器"],
  description:"寫一個副程式 `SafeAdd`，在內部先保存 WREG 與 STATUS，執行 `ADDLW 0x05` 後，恢復 STATUS 與 WREG 再返回。確保呼叫前後 WREG 和旗標不變。",
  testcase:"Testcase 1: 呼叫前 W=0x10, Z=1。呼叫後 W=0x10, Z=1。",
  code:`LIST p=18f4520
#include <p18f4520.inc>

SAVE_W   EQU 0x020
SAVE_ST  EQU 0x021

        ORG 0x0000
MAIN:
        ; --- Initialize test value ---
        MOVLW   0x10
        RCALL   SafeAdd
DONE:
        BRA     DONE

SafeAdd:
        ; --- Save context ---
        MOVWF   SAVE_W           
        SWAPF   STATUS, W        
        MOVWF   SAVE_ST

        ; --- Perform operation ---
        ADDLW   0x05             

        ; --- Restore context ---
        SWAPF   SAVE_ST, W       
        MOVWF   STATUS
        MOVF    SAVE_W, W        
        RETURN
        END`
},
{
  id:"ext-f9-macro-vs-sub",
  title:"F9 — Macro vs Subroutine",
  category:"F. 副程式與 Macro",
  tags:["Macro","Subroutine","比較"],
  description:"實作一個功能：將 WREG 加上 0x10。\n1. 使用 Macro `Add10M` 實作並呼叫兩次。\n2. 使用 Subroutine `Add10S` 實作並呼叫兩次。\n體會兩者在程式碼展開與跳躍上的差異。",
  testcase:"Testcase 1: W=0x00，執行完兩者後皆為 0x20",
  code:`LIST p=18f4520
#include <p18f4520.inc>

; --- Macro Definition ---
; Expands inline, no overhead for CALL/RETURN
Add10M MACRO
        ADDLW   0x10
        ENDM

        ORG 0x0000
MAIN:
        ; --- Test Macro ---
        MOVLW   0x00
        Add10M
        Add10M
        
        ; --- Test Subroutine ---
        MOVLW   0x00
        RCALL   Add10S
        RCALL   Add10S
DONE:
        BRA     DONE

; --- Subroutine Definition ---
; Occupies memory once, uses jumps to execute
Add10S:
        ADDLW   0x10
        RETURN
        END`
},
{
  id:"ext-f10-frac-simple",
  title:"F10 — Simplified Fraction Calc (Addition)",
  category:"F. 副程式與 Macro",
  tags:["fractionCalc","GCD","加法","化簡"],
  description:"實作最簡化的分數加法：計算 A/B + C/D。\n輸入：A=[0x000], B=[0x001], C=[0x002], D=[0x003]\n輸出：分子存 [0x010:0x011] (16-bit)，分母存 [0x012:0x013] (16-bit)，並需化簡。",
  testcase:"Testcase 1: 1/2 + 1/3 = 5/6 → 分子 0x0005, 分母 0x0006",
  code:`LIST p=18f4520
#include <p18f4520.inc>

        ORG 0x0000
MAIN:
        ; --- Initialize test fractions ---
        MOVLW   0x01
        MOVWF   0x000
        MOVLW   0x02
        MOVWF   0x001
        MOVLW   0x01
        MOVWF   0x002
        MOVLW   0x03
        MOVWF   0x003

        RCALL   AddFractions
DONE:
        BRA     DONE

; Simplified fraction addition
AddFractions:
        ; --- Numerator = A*D + C*B ---
        MOVF    0x000, W
        MULWF   0x003
        MOVFF   PRODL, 0x010  
        MOVFF   PRODH, 0x011  

        MOVF    0x002, W
        MULWF   0x001
        MOVF    PRODL, W
        ADDWF   0x010, F      
        MOVF    PRODH, W
        ADDWFC  0x011, F      

        ; --- Denominator = B*D ---
        MOVF    0x001, W
        MULWF   0x003
        MOVFF   PRODL, 0x012
        MOVFF   PRODH, 0x013

        ; Note: GCD simplification step omitted for brevity.
        RETURN
        END`
}
];